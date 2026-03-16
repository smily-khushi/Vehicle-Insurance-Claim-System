import React, { useState } from 'react';
import './ClaimForm.css';

const initialFormData = {
  // Policy Details
  policyNumber: '',
  vehicleNumber: '',
  // Incident Details
  incidentDate: '',
  incidentLocation: '',
  claimType: '',
  incidentDescription: '',
  estimatedRepairCost: '',
  anotherVehicleInvolved: '',
  otherVehicleNumber: '',
  otherDriverName: '',
  otherInsuranceCompany: '',
  policeComplaintFiled: '',
  // Document Uploads
  damagePhotos: [],
  firCopy: null,
  repairBills: null,
  surveyReport: null,
  claimForm: null,
};

const steps = ['Policy Details', 'Incident Info', 'Documents', 'Review'];

const requiredByStep = {
  0: ['policyNumber', 'vehicleNumber'],
  1: ['incidentDate', 'incidentLocation', 'claimType', 'incidentDescription', 'anotherVehicleInvolved', 'policeComplaintFiled'],
  2: ['damagePhotos', 'repairBills', 'surveyReport', 'claimForm'],
};

const fieldLabels = {
  policyNumber: 'Policy Number',
  vehicleNumber: 'Vehicle Number',
  incidentDate: 'Incident Date',
  incidentLocation: 'Incident Location',
  claimType: 'Claim Type',
  incidentDescription: 'Description',
  anotherVehicleInvolved: 'Another Vehicle Involved',
  policeComplaintFiled: 'Police Complaint Filed',
  otherVehicleNumber: 'Other Vehicle Number',
  damagePhotos: 'Damage Photos',
  firCopy: 'FIR Copy',
  repairBills: 'Repair Bills/Invoices',
  surveyReport: 'Survey Report',
  claimForm: 'Claim Form',
};

function ClaimForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [showValidation, setShowValidation] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'damagePhotos') {
        setFormData({
          ...formData,
          [name]: Array.from(files).slice(0, 5),
        });
      } else {
        setFormData({ ...formData, [name]: files[0] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getMissingFields = (stepIndex) => {
    const requiredFields = [...(requiredByStep[stepIndex] || [])];

    if (stepIndex === 1 && formData.anotherVehicleInvolved === 'Yes') {
      requiredFields.push('otherVehicleNumber');
    }

    if (stepIndex === 1 && formData.policeComplaintFiled === 'Yes') {
      requiredFields.push('firCopy');
    }

    return requiredFields.filter((field) => {
      const value = formData[field];
      if (Array.isArray(value)) return value.length === 0;
      return !value || String(value).trim() === '';
    });
  };

  const isStepValid = (stepIndex) => getMissingFields(stepIndex).length === 0;

  const nextStep = () => {
    if (!isStepValid(step)) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    const firstInvalidStep = [0, 1, 2].find((stepIndex) => !isStepValid(stepIndex));
    if (firstInvalidStep !== undefined) {
      setStep(firstInvalidStep);
      setShowValidation(true);
      return;
    }
    if (onSubmit) onSubmit(formData);
  };

  // Renderers for each step
  const renderPolicyDetails = () => (
    <div>
      <h3>Policy Details</h3>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Policy Number *</label>
          <input name="policyNumber" placeholder="e.g. POL-123456" value={formData.policyNumber} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label className="form-field-label">Vehicle Number *</label>
          <input name="vehicleNumber" placeholder="e.g. MH02CD5678" value={formData.vehicleNumber} onChange={handleChange} />
        </div>
      </div>
    </div>
  );

  const renderIncidentInfo = () => (
    <div>
      <h3>Incident Details</h3>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Incident Date *</label>
          <input name="incidentDate" value={formData.incidentDate} onChange={handleChange} type="date" />
        </div>
        <div className="form-field">
          <label className="form-field-label">Incident Location *</label>
          <input name="incidentLocation" placeholder="Enter location of incident" value={formData.incidentLocation} onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Claim Type *</label>
          <select name="claimType" value={formData.claimType} onChange={handleChange}>
            <option value="">Select claim type</option>
            <option value="Accident - Major">Accident - Major</option>
            <option value="Accident - Minor">Accident - Minor</option>
            <option value="Theft">Theft</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Description of Incident *</label>
          <textarea name="incidentDescription" placeholder="Describe what happened" value={formData.incidentDescription} onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Estimated Repair Cost</label>
          <input name="estimatedRepairCost" type="number" min="0" placeholder="Enter estimated cost" value={formData.estimatedRepairCost} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label className="form-field-label">Was another vehicle involved? *</label>
          <select name="anotherVehicleInvolved" value={formData.anotherVehicleInvolved} onChange={handleChange}>
            <option value="">Select option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {formData.anotherVehicleInvolved === 'Yes' && (
        <div className="conditional-card">
          <h4>Other Vehicle Details</h4>
          <div className="form-row form-row-3">
            <div className="form-field">
              <label className="form-field-label">Other Vehicle Number *</label>
              <input name="otherVehicleNumber" placeholder="e.g. MH02CD5678" value={formData.otherVehicleNumber} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-field-label">Other Driver Name</label>
              <input name="otherDriverName" placeholder="Optional" value={formData.otherDriverName} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="form-field-label">Other Insurance Company</label>
              <input name="otherInsuranceCompany" placeholder="Optional" value={formData.otherInsuranceCompany} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Was a police complaint filed? *</label>
          <select name="policeComplaintFiled" value={formData.policeComplaintFiled} onChange={handleChange}>
            <option value="">Select option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {formData.policeComplaintFiled === 'Yes' && (
        <div className="form-row">
          <div className="form-field">
            <label className="form-field-label">Upload FIR Copy *</label>
            <input name="firCopy" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} />
          </div>
        </div>
      )}

      {formData.policeComplaintFiled === 'No' && (
        <div className="info-chip">FIR copy is not required when police complaint is No.</div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div>
      <h3>Document Upload</h3>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Photos of Damaged Vehicle (max 5) *</label>
          <input name="damagePhotos" type="file" accept=".jpg,.jpeg,.png" multiple onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Repair Bills/Invoices *</label>
          <input name="repairBills" type="file" accept=".pdf" onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Survey Report *</label>
          <input name="surveyReport" type="file" accept=".pdf" onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-field-label">Claim Form *</label>
          <input name="claimForm" type="file" accept=".pdf" onChange={handleChange} />
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div>
      <h3>Review Your Claim</h3>
      <div className="review-section">
        <h4>Policy Information</h4>
        <p><b>Policy Number:</b> {formData.policyNumber}</p>
        <p><b>Vehicle Number:</b> {formData.vehicleNumber}</p>
      </div>
      <div className="review-section">
        <h4>Incident Details</h4>
        <p><b>Incident Date:</b> {formData.incidentDate || 'N/A'}</p>
        <p><b>Incident Location:</b> {formData.incidentLocation}</p>
        <p><b>Claim Type:</b> {formData.claimType}</p>
        <p><b>Police Complaint Filed:</b> {formData.policeComplaintFiled}</p>
        <p><b>Another Vehicle Involved:</b> {formData.anotherVehicleInvolved}</p>
        {formData.anotherVehicleInvolved === 'Yes' && <p><b>Other Vehicle Number:</b> {formData.otherVehicleNumber}</p>}
        <p><b>Estimated Repair Cost:</b> ₹ {formData.estimatedRepairCost}</p>
        <p><b>Description:</b> {formData.incidentDescription}</p>
      </div>
      <div className="review-section">
        <h4>Documents Uploaded</h4>
        <ul>
          <li>{formData.damagePhotos.length > 0 ? '✔' : '✗'} Damage Photos</li>
          {formData.policeComplaintFiled === 'Yes' && <li>{formData.firCopy ? '✔' : '✗'} FIR Copy</li>}
          <li>{formData.repairBills ? '✔' : '✗'} Repair Bills/Invoices</li>
          <li>{formData.surveyReport ? '✔' : '✗'} Survey Report</li>
          <li>{formData.claimForm ? '✔' : '✗'} Claim Form</li>
        </ul>
      </div>
    </div>
  );

  return (
    <form className="claim-form" onSubmit={handleSubmit}>
      <div className="stepper">
        {steps.map((label, idx) => (
          <div key={label} className="step-item">
            <div className={`step ${step === idx ? 'active' : step > idx ? 'completed' : ''}`}>{step > idx ? '✓' : idx + 1}</div>
            <div className="step-label">{label}</div>
            {idx < steps.length - 1 && (
              <div className={`step-connector ${step > idx ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
      {showValidation && step < steps.length - 1 && !isStepValid(step) && (
        <p className="validation-hint">
          Please fill required fields: {getMissingFields(step).map((field) => fieldLabels[field]).join(', ')}
        </p>
      )}
      <div className="step-content">
        {step === 0 && renderPolicyDetails()}
        {step === 1 && renderIncidentInfo()}
        {step === 2 && renderDocuments()}
        {step === 3 && renderReview()}
      </div>
      <div className="form-actions">
        {step > 0 && <button type="button" onClick={prevStep}>Previous</button>}
        {step < steps.length - 1 && <button type="button" onClick={nextStep} disabled={!isStepValid(step)}>Next</button>}
        {step === steps.length - 1 && <button type="submit">Submit Claim</button>}
      </div>
    </form>
  );
}

export default ClaimForm;
