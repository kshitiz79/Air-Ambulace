import { triggerScriptWarning } from '../components/Common/ScriptWarningToast';

const DEVANAGARI = /[\u0900-\u097F]/;
const LATIN = /[a-zA-Z]/;

/**
 * Returns a filtered onChange handler that:
 * - Blocks Latin characters when language is 'hi'
 * - Blocks Devanagari characters when language is 'en'
 * Shows a warning toast when the wrong script is typed.
 */
export function restrictedChange(handleChange, language) {
  return (e) => {
    const { value } = e.target;

    if (language === 'hi' && LATIN.test(value)) {
      const filtered = value.replace(/[a-zA-Z]/g, '');
      triggerScriptWarning('हिंदी मोड में केवल हिंदी (देवनागरी) अक्षर टाइप करें। English letters not allowed.');
      handleChange({ ...e, target: { ...e.target, value: filtered } });
      return;
    }

    if (language === 'en' && DEVANAGARI.test(value)) {
      const filtered = value.replace(/[\u0900-\u097F]/g, '');
      triggerScriptWarning('English mode: Only English letters allowed. हिंदी अक्षर यहाँ नहीं चलेंगे।');
      handleChange({ ...e, target: { ...e.target, value: filtered } });
      return;
    }

    handleChange(e);
  };
}
