import http from "src/services/01_axios";

// Fake data for Mocking
const mockJournals = [
  { id: 1, name: "Tomato Greenhouse A", crop: "Tomato", status: "Active", startDate: "2023-01-01", expectedHarvest: "2023-04-01" },
  { id: 2, name: "Rice Field B", crop: "Rice", status: "Completed", startDate: "2022-05-01", expectedHarvest: "2022-09-01" },
  { id: 3, name: "Organic Cabbage C", crop: "Cabbage", status: "Active", startDate: "2023-02-15", expectedHarvest: "2023-05-15" }
];

const JournalService = {
  // TODO: Replace with real backend API
  // GET /api/journals
  getListJournal: async (params) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fake pagination
    return {
      Status: 0,
      Object: {
        data: mockJournals,
        total: mockJournals.length,
      }
    };
  },

  getJournalDetail: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const journal = mockJournals.find(j => j.id === parseInt(id));
    if (!journal) {
      return { Status: 1, Object: "Not Found" };
    }
    return {
      Status: 0,
      Object: journal
    };
  },

  createJournal: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newId = mockJournals.length + 1;
    return {
      Status: 0,
      Object: { id: newId, ...data }
    };
  },
  
  updateJournal: async (id, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      Status: 0,
      Object: { id, ...data }
    };
  },

  deleteJournal: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      Status: 0,
      Object: true
    };
  }
};

export default JournalService;
