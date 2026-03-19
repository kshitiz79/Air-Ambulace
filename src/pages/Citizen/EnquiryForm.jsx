import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext.jsx";

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    ayushmanCard: "",
    medicalCondition: "",
    hospitalName: "",
    hospitalLocation: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    document: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = `${t.patientName} ${t.requiredField}`;
    if (!formData.ayushmanCard || !formData.ayushmanCard.match(/^\d{14}$/))
      newErrors.ayushmanCard = t.ayushmanCardError || "Ayushman Card Number must be 14 digits";
    if (!formData.medicalCondition.trim()) newErrors.medicalCondition = `${t.medicalCondition} ${t.requiredField}`;
    if (!formData.hospitalName.trim()) newErrors.hospitalName = `${t.hospitalName} ${t.requiredField}`;
    if (!formData.hospitalLocation.trim()) newErrors.hospitalLocation = `${t.hospitalLocation} ${t.requiredField}`;
    if (!formData.contactName.trim()) newErrors.contactName = `${t.contactPersonName} ${t.requiredField}`;
    if (!formData.contactPhone || !formData.contactPhone.match(/^\d{10}$/))
      newErrors.contactPhone = t.contactPhoneError || "Contact Phone must be 10 digits";
    if (!formData.contactEmail || !formData.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.contactEmail = t.validEmailError || "Valid Email is required";
    if (formData.document && formData.document.size > 5 * 1024 * 1024)
      newErrors.document = t.fileSizeError || "File size must be less than 5MB";
    return newErrors;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    // Clear error for the field being edited
    setErrors({ ...errors, [name]: null });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!window.confirm("Are you sure you want to submit the enquiry?")) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await axios.post("/api/enquiry", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { enquiryId } = response.data;
      alert(
        `Enquiry submitted successfully! Enquiry ID: ${enquiryId}. Check status in the Status Check page.`
      );
      setFormData({
        patientName: "",
        ayushmanCard: "",
        medicalCondition: "",
        hospitalName: "",
        hospitalLocation: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        document: null,
      });
      navigate(`/status-check?enquiryId=${enquiryId}`);
    } catch (error) {
      alert("Failed to submit enquiry. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t.enquiryForm || "Enquiry Form"}</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label htmlFor="patientName" className="block text-sm font-medium">
            {t.patientName}
          </label>
          <input
            type="text"
            id="patientName"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder={t.patientName}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.patientName ? "patientName-error" : null}
          />
          {errors.patientName && (
            <p id="patientName-error" className="text-red-600 text-sm">
              {errors.patientName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="ayushmanCard" className="block text-sm font-medium">
            {t.ayushmanCardNumber}
          </label>
          <input
            type="text"
            id="ayushmanCard"
            name="ayushmanCard"
            value={formData.ayushmanCard}
            onChange={handleChange}
            placeholder={t.ayushmanCardNumber}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.ayushmanCard ? "ayushmanCard-error" : null}
          />
          {errors.ayushmanCard && (
            <p id="ayushmanCard-error" className="text-red-600 text-sm">
              {errors.ayushmanCard}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="medicalCondition" className="block text-sm font-medium">
            {t.medicalCondition}
          </label>
          <textarea
            id="medicalCondition"
            name="medicalCondition"
            value={formData.medicalCondition}
            onChange={handleChange}
            placeholder={t.medicalCondition}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            required
            aria-describedby={errors.medicalCondition ? "medicalCondition-error" : null}
          />
          {errors.medicalCondition && (
            <p id="medicalCondition-error" className="text-red-600 text-sm">
              {errors.medicalCondition}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="hospitalName" className="block text-sm font-medium">
            {t.hospitalName}
          </label>
          <input
            type="text"
            id="hospitalName"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            placeholder={t.hospitalName}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.hospitalName ? "hospitalName-error" : null}
          />
          {errors.hospitalName && (
            <p id="hospitalName-error" className="text-red-600 text-sm">
              {errors.hospitalName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="hospitalLocation" className="block text-sm font-medium">
            {t.hospitalLocation}
          </label>
          <input
            type="text"
            id="hospitalLocation"
            name="hospitalLocation"
            value={formData.hospitalLocation}
            onChange={handleChange}
            placeholder={t.hospitalLocation}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.hospitalLocation ? "hospitalLocation-error" : null}
          />
          {errors.hospitalLocation && (
            <p id="hospitalLocation-error" className="text-red-600 text-sm">
              {errors.hospitalLocation}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium">
            {t.contactPersonName}
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder={t.contactPersonName}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.contactName ? "contactName-error" : null}
          />
          {errors.contactName && (
            <p id="contactName-error" className="text-red-600 text-sm">
              {errors.contactName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium">
            {t.contactPhoneNumber}
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder={t.contactPhoneNumber}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.contactPhone ? "contactPhone-error" : null}
          />
          {errors.contactPhone && (
            <p id="contactPhone-error" className="text-red-600 text-sm">
              {errors.contactPhone}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium">
            {t.email}
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder={t.email}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
            aria-describedby={errors.contactEmail ? "contactEmail-error" : null}
          />
          {errors.contactEmail && (
            <p id="contactEmail-error" className="text-red-600 text-sm">
              {errors.contactEmail}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="document" className="block text-sm font-medium">
            {t.uploadDocumentOptional}
          </label>
          <input
            type="file"
            id="document"
            name="document"
            onChange={handleChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-describedby={errors.document ? "document-error" : null}
          />
          {errors.document && (
            <p id="document-error" className="text-red-600 text-sm">
              {errors.document}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200`}
        >
          {isSubmitting ? (t.submitting || "Submitting...") : (t.submitEnquiry || "Submit Enquiry")}
        </button>
      </form>
    </div>
  );
}