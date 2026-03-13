/**
 * AI Service for Patient Health Risk Prediction
 * Uses statistical models and heuristics when TensorFlow is unavailable
 */

const logger = require('../../utils/logger');

class HealthRiskPredictionService {
  constructor() {
    this.model = null;
    this.isModelLoaded = false;
  }

  /**
   * Predict health risk score for a patient based on their profile
   * @param {Object} patientData - Patient health data
   * @returns {Object} - Risk score and level
   */
  async predictRisk(patientData) {
    try {
      const features = this._extractFeatures(patientData);
      const score = this._computeRiskScore(features);
      const level = this._getRiskLevel(score);
      const factors = this._identifyRiskFactors(patientData, features);

      return {
        score: parseFloat(score.toFixed(3)),
        level,
        factors,
        recommendations: this._getRecommendations(level, factors),
        computed_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error predicting health risk:', error);
      return {
        score: 0,
        level: 'low',
        factors: [],
        recommendations: [],
        computed_at: new Date().toISOString(),
        error: 'Risk prediction temporarily unavailable',
      };
    }
  }

  /**
   * Detect emergency/critical conditions
   * @param {Object} vitalSigns - Patient vital signs
   * @returns {Object} - Emergency detection result
   */
  detectEmergency(vitalSigns) {
    const alerts = [];
    const {
      systolic_bp,
      diastolic_bp,
      heart_rate,
      temperature,
      oxygen_saturation,
      respiratory_rate,
    } = vitalSigns;

    // Blood pressure checks
    if (systolic_bp !== undefined) {
      if (systolic_bp > 180 || systolic_bp < 70) {
        alerts.push({
          type: 'critical',
          parameter: 'systolic_blood_pressure',
          value: systolic_bp,
          message: `Critical systolic BP: ${systolic_bp} mmHg`,
        });
      } else if (systolic_bp > 140 || systolic_bp < 90) {
        alerts.push({
          type: 'warning',
          parameter: 'systolic_blood_pressure',
          value: systolic_bp,
          message: `Abnormal systolic BP: ${systolic_bp} mmHg`,
        });
      }
    }

    // Heart rate checks
    if (heart_rate !== undefined) {
      if (heart_rate > 150 || heart_rate < 40) {
        alerts.push({
          type: 'critical',
          parameter: 'heart_rate',
          value: heart_rate,
          message: `Critical heart rate: ${heart_rate} bpm`,
        });
      } else if (heart_rate > 100 || heart_rate < 60) {
        alerts.push({
          type: 'warning',
          parameter: 'heart_rate',
          value: heart_rate,
          message: `Abnormal heart rate: ${heart_rate} bpm`,
        });
      }
    }

    // Oxygen saturation checks
    if (oxygen_saturation !== undefined) {
      if (oxygen_saturation < 90) {
        alerts.push({
          type: 'critical',
          parameter: 'oxygen_saturation',
          value: oxygen_saturation,
          message: `Critical O2 saturation: ${oxygen_saturation}%`,
        });
      } else if (oxygen_saturation < 95) {
        alerts.push({
          type: 'warning',
          parameter: 'oxygen_saturation',
          value: oxygen_saturation,
          message: `Low O2 saturation: ${oxygen_saturation}%`,
        });
      }
    }

    // Temperature checks
    if (temperature !== undefined) {
      if (temperature > 40 || temperature < 35) {
        alerts.push({
          type: 'critical',
          parameter: 'temperature',
          value: temperature,
          message: `Critical temperature: ${temperature}°C`,
        });
      } else if (temperature > 38 || temperature < 36) {
        alerts.push({
          type: 'warning',
          parameter: 'temperature',
          value: temperature,
          message: `Abnormal temperature: ${temperature}°C`,
        });
      }
    }

    // Respiratory rate checks
    if (respiratory_rate !== undefined) {
      if (respiratory_rate > 30 || respiratory_rate < 8) {
        alerts.push({
          type: 'critical',
          parameter: 'respiratory_rate',
          value: respiratory_rate,
          message: `Critical respiratory rate: ${respiratory_rate}/min`,
        });
      }
    }

    const hasCritical = alerts.some((a) => a.type === 'critical');
    const hasWarning = alerts.some((a) => a.type === 'warning');

    return {
      is_emergency: hasCritical,
      severity: hasCritical ? 'critical' : hasWarning ? 'warning' : 'normal',
      alerts,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Predict patient readmission risk
   * @param {Object} patientHistory - Patient history data
   * @returns {Object} - Readmission risk assessment
   */
  assessReadmissionRisk(patientHistory) {
    const {
      previous_admissions = 0,
      chronic_conditions = [],
      age,
      recent_discharge_days = null,
      medication_count = 0,
      follow_up_attended = true,
    } = patientHistory;

    let riskScore = 0;

    // Previous admissions factor
    if (previous_admissions >= 3) riskScore += 0.3;
    else if (previous_admissions >= 1) riskScore += 0.15;

    // Chronic conditions factor
    if (chronic_conditions.length >= 3) riskScore += 0.25;
    else if (chronic_conditions.length >= 1) riskScore += 0.1;

    // Age factor
    if (age >= 75) riskScore += 0.2;
    else if (age >= 65) riskScore += 0.1;

    // Recent discharge factor
    if (recent_discharge_days !== null) {
      if (recent_discharge_days <= 7) riskScore += 0.25;
      else if (recent_discharge_days <= 30) riskScore += 0.15;
    }

    // Medication complexity
    if (medication_count >= 10) riskScore += 0.15;
    else if (medication_count >= 5) riskScore += 0.08;

    // Follow-up compliance
    if (!follow_up_attended) riskScore += 0.15;

    riskScore = Math.min(1, riskScore);
    const riskLevel =
      riskScore >= 0.7
        ? 'high'
        : riskScore >= 0.4
        ? 'medium'
        : 'low';

    return {
      risk_score: parseFloat(riskScore.toFixed(3)),
      risk_level: riskLevel,
      risk_percentage: Math.round(riskScore * 100),
      contributing_factors: this._getReadmissionFactors(patientHistory),
      recommended_actions: this._getReadmissionActions(riskLevel),
      assessment_date: new Date().toISOString(),
    };
  }

  // ---- Private helper methods ----

  _extractFeatures(patientData) {
    const age = patientData.age || 0;
    const chronicCount = (patientData.chronic_conditions || []).length;
    const allergyCount = (patientData.allergies || []).length;
    const medicationCount = (patientData.current_medications || []).length;
    const previousAdmissions = patientData.previous_admissions || 0;
    const smokingHistory = patientData.smoking_history ? 1 : 0;
    const familyHistory = patientData.family_history_score || 0;
    const bmi = patientData.bmi || 22;

    return {
      age,
      chronicCount,
      allergyCount,
      medicationCount,
      previousAdmissions,
      smokingHistory,
      familyHistory,
      bmi,
    };
  }

  _computeRiskScore(features) {
    let score = 0;

    // Age contribution (normalized 0-1)
    if (features.age >= 70) score += 0.25;
    else if (features.age >= 50) score += 0.15;
    else if (features.age >= 40) score += 0.08;

    // Chronic conditions
    score += Math.min(0.3, features.chronicCount * 0.08);

    // Medications (polypharmacy risk)
    score += Math.min(0.15, features.medicationCount * 0.02);

    // Previous admissions
    score += Math.min(0.2, features.previousAdmissions * 0.07);

    // BMI
    if (features.bmi >= 35 || features.bmi < 18) score += 0.1;
    else if (features.bmi >= 30) score += 0.05;

    // Smoking
    score += features.smokingHistory * 0.1;

    // Family history
    score += features.familyHistory * 0.1;

    return Math.min(1, score);
  }

  _getRiskLevel(score) {
    if (score >= 0.75) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.25) return 'medium';
    return 'low';
  }

  _identifyRiskFactors(patientData, features) {
    const factors = [];

    if (features.age >= 70) factors.push({ factor: 'Advanced age', weight: 'high' });
    if (features.chronicCount >= 3)
      factors.push({ factor: 'Multiple chronic conditions', weight: 'high' });
    if (features.medicationCount >= 5)
      factors.push({ factor: 'Polypharmacy', weight: 'medium' });
    if (features.previousAdmissions >= 2)
      factors.push({ factor: 'Frequent hospitalizations', weight: 'high' });
    if (features.bmi >= 35)
      factors.push({ factor: 'Severe obesity', weight: 'medium' });
    if (features.smokingHistory)
      factors.push({ factor: 'Smoking history', weight: 'medium' });

    return factors;
  }

  _getRecommendations(level, factors) {
    const recs = [];
    if (level === 'critical' || level === 'high') {
      recs.push('Schedule immediate physician review');
      recs.push('Consider intensive monitoring protocol');
    }
    if (level === 'medium') {
      recs.push('Schedule follow-up within 2 weeks');
      recs.push('Review medication list');
    }
    recs.push('Encourage regular exercise and healthy diet');
    if (factors.some((f) => f.factor === 'Smoking history')) {
      recs.push('Refer to smoking cessation program');
    }
    return recs;
  }

  _getReadmissionFactors(patientHistory) {
    const factors = [];
    if (patientHistory.previous_admissions >= 2)
      factors.push('Multiple previous admissions');
    if ((patientHistory.chronic_conditions || []).length >= 2)
      factors.push('Multiple chronic conditions');
    if (patientHistory.age >= 65) factors.push('Age over 65');
    if (!patientHistory.follow_up_attended)
      factors.push('Missed follow-up appointments');
    if (patientHistory.medication_count >= 5)
      factors.push('Complex medication regimen');
    return factors;
  }

  _getReadmissionActions(level) {
    if (level === 'high') {
      return [
        'Schedule 7-day post-discharge follow-up',
        'Enroll in care management program',
        'Medication reconciliation review',
        'Home health assessment',
      ];
    }
    if (level === 'medium') {
      return [
        'Schedule 14-day follow-up',
        'Patient education on warning signs',
        'Medication review',
      ];
    }
    return [
      'Standard 30-day follow-up',
      'Patient education materials',
    ];
  }
}

module.exports = new HealthRiskPredictionService();
