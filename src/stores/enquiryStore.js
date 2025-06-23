import { create } from 'zustand';

export const useEnquiryStore = create((set) => ({
  enquiries: [
    // Sample dummy data for testing
    {
      enquiryId: 'MP1234',
      patientName: 'Ravi Kumar',
      status: 'Approved',
      hospitalName: 'AIIMS Bhopal',
      hospitalLocation: 'Bhopal, MP',
    },
    {
      enquiryId: 'MP5678',
      patientName: 'Sunita Devi',
      status: 'Pending',
      hospitalName: 'CHL Hospital',
      hospitalLocation: 'Indore, MP',
    },
  ],
}));
