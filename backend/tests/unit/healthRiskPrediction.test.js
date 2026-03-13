const healthRiskService = require('../../src/services/ai/healthRiskPrediction');

describe('Health Risk Prediction Service', () => {
  describe('predictRisk', () => {
    it('should return a risk assessment with required fields', async () => {
      const result = await healthRiskService.predictRisk({
        age: 45,
        chronic_conditions: ['hypertension'],
        allergies: [],
        current_medications: [],
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('recommendations');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should assign high risk to elderly patients with multiple conditions', async () => {
      const result = await healthRiskService.predictRisk({
        age: 75,
        chronic_conditions: ['diabetes', 'hypertension', 'COPD'],
        allergies: ['penicillin'],
        current_medications: [
          { name: 'metformin' },
          { name: 'lisinopril' },
          { name: 'albuterol' },
          { name: 'aspirin' },
          { name: 'atorvastatin' },
          { name: 'amlodipine' },
        ],
        previous_admissions: 3,
        smoking_history: true,
      });

      expect(['high', 'critical']).toContain(result.level);
      expect(result.score).toBeGreaterThan(0.4);
    });

    it('should assign low risk to young healthy patients', async () => {
      const result = await healthRiskService.predictRisk({
        age: 25,
        chronic_conditions: [],
        allergies: [],
        current_medications: [],
        previous_admissions: 0,
        smoking_history: false,
        bmi: 22,
      });

      expect(result.level).toBe('low');
      expect(result.score).toBeLessThan(0.3);
    });
  });

  describe('detectEmergency', () => {
    it('should detect critical blood pressure', () => {
      const result = healthRiskService.detectEmergency({
        systolic_bp: 185,
        diastolic_bp: 95,
        heart_rate: 80,
        temperature: 37.0,
        oxygen_saturation: 98,
      });

      expect(result.is_emergency).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.alerts.length).toBeGreaterThan(0);
    });

    it('should return normal for healthy vitals', () => {
      const result = healthRiskService.detectEmergency({
        systolic_bp: 120,
        diastolic_bp: 80,
        heart_rate: 72,
        temperature: 37.0,
        oxygen_saturation: 99,
        respiratory_rate: 16,
      });

      expect(result.is_emergency).toBe(false);
      expect(result.severity).toBe('normal');
      expect(result.alerts).toHaveLength(0);
    });

    it('should detect low oxygen saturation as critical', () => {
      const result = healthRiskService.detectEmergency({
        oxygen_saturation: 88,
      });

      expect(result.is_emergency).toBe(true);
      const o2Alert = result.alerts.find((a) => a.parameter === 'oxygen_saturation');
      expect(o2Alert).toBeDefined();
      expect(o2Alert.type).toBe('critical');
    });
  });

  describe('assessReadmissionRisk', () => {
    it('should return high risk for frequent readmission patients', () => {
      const result = healthRiskService.assessReadmissionRisk({
        age: 70,
        previous_admissions: 4,
        chronic_conditions: ['heart_failure', 'diabetes', 'COPD'],
        medication_count: 8,
        recent_discharge_days: 5,
        follow_up_attended: false,
      });

      expect(result.risk_level).toBe('high');
      expect(result.risk_score).toBeGreaterThan(0.5);
    });

    it('should return low risk for healthy young patients', () => {
      const result = healthRiskService.assessReadmissionRisk({
        age: 30,
        previous_admissions: 0,
        chronic_conditions: [],
        medication_count: 0,
        follow_up_attended: true,
      });

      expect(result.risk_level).toBe('low');
    });

    it('should include assessment fields', () => {
      const result = healthRiskService.assessReadmissionRisk({
        age: 50,
        previous_admissions: 1,
        chronic_conditions: ['hypertension'],
      });

      expect(result).toHaveProperty('risk_score');
      expect(result).toHaveProperty('risk_level');
      expect(result).toHaveProperty('risk_percentage');
      expect(result).toHaveProperty('contributing_factors');
      expect(result).toHaveProperty('recommended_actions');
      expect(result).toHaveProperty('assessment_date');
    });
  });
});
