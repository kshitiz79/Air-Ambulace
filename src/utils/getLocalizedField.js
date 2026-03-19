/**
 * Returns the localized value of an enquiry field.
 *
 * For Hindi, it looks for a `<field>_hi` property on the object.
 * Falls back to the English value if the Hindi translation is missing.
 *
 * Usage:
 *   getLocalizedField(enquiry, 'patient_name', language)
 *   // returns enquiry.patient_name_hi when language === 'hi',
 *   // otherwise enquiry.patient_name
 */
export function getLocalizedField(obj, field, language) {
  if (!obj) return '';
  if (language === 'hi') {
    const hiValue = obj[`${field}_hi`];
    if (hiValue && hiValue.trim()) return hiValue;
  }
  return obj[field] ?? '';
}

/**
 * Returns a new object where all translatable fields are replaced
 * with their localized versions. Useful when passing an enquiry to
 * a component that reads fields directly.
 *
 * Translatable fields (those that have a _hi counterpart):
 */
const TRANSLATABLE_FIELDS = [
  'patient_name',
  'father_spouse_name',
  'address',
  'medical_condition',
  'chief_complaint',
  'general_condition',
  'referral_note',
  'recommending_authority_name',
  'recommending_authority_designation',
  'approval_authority_name',
  'approval_authority_designation',
  'referring_physician_name',
  'referring_physician_designation',
  'medical_team_note',
  'remarks',
  'contact_name',
];

export function localizeEnquiry(enquiry, language) {
  if (!enquiry || language !== 'hi') return enquiry;
  const localized = { ...enquiry };
  for (const field of TRANSLATABLE_FIELDS) {
    const hiVal = enquiry[`${field}_hi`];
    if (hiVal && hiVal.trim()) {
      localized[field] = hiVal;
    }
  }
  return localized;
}
