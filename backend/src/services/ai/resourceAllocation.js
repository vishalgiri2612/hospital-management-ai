/**
 * AI Service for Hospital Resource Allocation and Capacity Planning
 */
const logger = require('../../utils/logger');

class ResourceAllocationService {
  /**
   * Predict resource demand for the next N days
   * @param {Object} historicalData - Historical usage patterns
   * @param {number} daysAhead - Number of days to forecast
   * @returns {Object} - Demand forecast
   */
  predictResourceDemand(historicalData, daysAhead = 7) {
    try {
      const forecast = [];
      const baselineAvg = this._computeBaseline(historicalData.daily_admissions || []);

      for (let day = 1; day <= daysAhead; day++) {
        const seasonalFactor = this._getSeasonalFactor(new Date(Date.now() + day * 86400000));
        const predictedAdmissions = Math.round(baselineAvg * seasonalFactor);

        forecast.push({
          date: new Date(Date.now() + day * 86400000).toISOString().split('T')[0],
          predicted_admissions: predictedAdmissions,
          required_beds: Math.ceil(predictedAdmissions * 1.2),
          required_staff: this._estimateStaffNeeds(predictedAdmissions),
          required_icu_beds: Math.ceil(predictedAdmissions * 0.1),
          confidence: 0.75,
        });
      }

      return {
        forecast,
        peak_day: forecast.reduce((max, d) =>
          d.predicted_admissions > max.predicted_admissions ? d : max
        ),
        average_predicted_admissions: parseFloat(
          (forecast.reduce((sum, d) => sum + d.predicted_admissions, 0) / daysAhead).toFixed(1)
        ),
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error in resource demand prediction:', error);
      return { forecast: [], error: 'Prediction temporarily unavailable' };
    }
  }

  /**
   * Optimize bed allocation across departments
   * @param {Object} currentOccupancy - Current bed usage
   * @param {Object} capacityData - Total bed capacity by department
   * @returns {Object} - Allocation recommendations
   */
  optimizeBedAllocation(currentOccupancy, capacityData) {
    const recommendations = [];
    let overallUtilization = 0;
    const departments = Object.keys(capacityData);

    departments.forEach((dept) => {
      const capacity = capacityData[dept] || 0;
      const occupied = (currentOccupancy[dept] || 0);
      const utilization = capacity > 0 ? occupied / capacity : 0;
      overallUtilization += utilization;

      if (utilization > 0.9) {
        recommendations.push({
          department: dept,
          action: 'URGENT: Transfer patients or add temporary beds',
          utilization: parseFloat((utilization * 100).toFixed(1)),
          priority: 'high',
        });
      } else if (utilization > 0.75) {
        recommendations.push({
          department: dept,
          action: 'Monitor closely and prepare overflow plan',
          utilization: parseFloat((utilization * 100).toFixed(1)),
          priority: 'medium',
        });
      } else if (utilization < 0.3) {
        recommendations.push({
          department: dept,
          action: 'Consider temporarily repurposing beds',
          utilization: parseFloat((utilization * 100).toFixed(1)),
          priority: 'low',
        });
      }
    });

    return {
      overall_utilization: parseFloat(
        ((overallUtilization / Math.max(1, departments.length)) * 100).toFixed(1)
      ),
      department_status: departments.map((dept) => ({
        department: dept,
        capacity: capacityData[dept],
        occupied: currentOccupancy[dept] || 0,
        available: (capacityData[dept] || 0) - (currentOccupancy[dept] || 0),
        utilization_pct: capacityData[dept]
          ? parseFloat(((currentOccupancy[dept] || 0) / capacityData[dept] * 100).toFixed(1))
          : 0,
      })),
      recommendations,
      analyzed_at: new Date().toISOString(),
    };
  }

  /**
   * Predict inventory demand based on patient admission forecasts
   * @param {Array} admissionForecast - Predicted admissions per day
   * @param {Array} inventoryItems - Current inventory levels
   * @returns {Array} - Inventory reorder recommendations
   */
  predictInventoryDemand(admissionForecast, inventoryItems) {
    return inventoryItems.map((item) => {
      const avgAdmissions =
        admissionForecast.reduce((sum, d) => sum + d.predicted_admissions, 0) /
        Math.max(1, admissionForecast.length);
      const dailyUsageRate = item.daily_usage_rate || avgAdmissions * 0.5;
      const daysOfStock = item.quantity_in_stock / Math.max(0.1, dailyUsageRate);
      const reorderPoint = item.minimum_stock_level || dailyUsageRate * 7;

      const needsReorder = item.quantity_in_stock <= reorderPoint;
      return {
        item_id: item.id,
        item_name: item.name,
        current_stock: item.quantity_in_stock,
        days_of_stock: parseFloat(daysOfStock.toFixed(1)),
        needs_reorder: needsReorder,
        recommended_order_quantity: needsReorder ? Math.ceil(dailyUsageRate * 30) : 0,
        urgency: daysOfStock < 3 ? 'critical' : daysOfStock < 7 ? 'high' : 'normal',
      };
    });
  }

  // ---- Private helpers ----

  _computeBaseline(dailyAdmissions) {
    if (!dailyAdmissions.length) return 20; // Default baseline
    return dailyAdmissions.reduce((sum, d) => sum + d, 0) / dailyAdmissions.length;
  }

  _getSeasonalFactor(date) {
    const month = date.getMonth();
    // Winter months tend to have higher admissions (flu season)
    const seasonalFactors = [1.2, 1.15, 1.0, 0.95, 0.9, 0.9, 0.95, 0.95, 1.0, 1.05, 1.1, 1.2];
    return seasonalFactors[month];
  }

  _estimateStaffNeeds(predictedAdmissions) {
    return {
      doctors: Math.ceil(predictedAdmissions / 8),
      nurses: Math.ceil(predictedAdmissions / 4),
      support_staff: Math.ceil(predictedAdmissions / 6),
    };
  }
}

module.exports = new ResourceAllocationService();
