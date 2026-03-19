/**
 * Centralized translations — split by domain for easy debugging.
 *
 * Parts:
 *  common.js      — shared UI strings (buttons, status labels, generic)
 *  enquiryForm.js — enquiry creation form fields & validation
 *  dashboard.js   — dashboard titles, stats, charts, role labels
 *  sidebar.js     — navigation / sidebar menu labels
 *  queries.js     — query/response system between roles
 *  caseFile.js    — case file management & approval flow
 *  search.js      — advanced search page
 *  auth.js        — login, OTP, password reset
 *  homePage.js    — public home page content & features
 */

import common from './common';
import enquiryForm from './enquiryForm';
import dashboard from './dashboard';
import sidebar from './sidebar';
import queries from './queries';
import caseFile from './caseFile';
import search from './search';
import auth from './auth';
import homePage from './homePage';

const translations = {
  en: {
    ...common.en,
    ...enquiryForm.en,
    ...dashboard.en,
    ...sidebar.en,
    ...queries.en,
    ...caseFile.en,
    ...search.en,
    ...auth.en,
    ...homePage.en,
  },
  hi: {
    ...common.hi,
    ...enquiryForm.hi,
    ...dashboard.hi,
    ...sidebar.hi,
    ...queries.hi,
    ...caseFile.hi,
    ...search.hi,
    ...auth.hi,
    ...homePage.hi,
  },
};

export default translations;
