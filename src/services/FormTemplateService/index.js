// Fake data for form templates
const mockTemplates = [
  { 
    id: 1, 
    name: "Food Safety Assessment", 
    fields: [
      { name: "inspector", label: "Inspector Name", type: "text", required: true },
      { name: "assessmentDate", label: "Date of Assessment", type: "date", required: true },
      { name: "isPassed", label: "Passed", type: "checkbox", required: false },
      { name: "notes", label: "Additional Notes", type: "textarea", required: false }
    ]
  },
  { 
    id: 2, 
    name: "Input Seed Tracking", 
    fields: [
      { name: "seedName", label: "Seed Name", type: "text", required: true },
      { name: "quantity", label: "Quantity (kg)", type: "number", required: true },
      { name: "supplier", label: "Supplier", type: "text", required: true }
    ]
  }
];

const FormTemplateService = {
  // TODO: Replace with real backend API
  // GET /api/form-templates
  getListTemplates: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      Status: 0,
      Object: mockTemplates
    };
  },

  getTemplateDetail: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const template = mockTemplates.find(t => t.id === parseInt(id));
    return {
      Status: template ? 0 : 1,
      Object: template || "Not Found"
    };
  }
};

export default FormTemplateService;
