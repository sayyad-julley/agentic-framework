'use client';

import AntiPatternLayout from '@/components/AntiPatternLayout';

const antipatternCode = `// ❌ Bad: Context for high-frequency updates
const FormContext = createContext();

function FormProvider({ children }) {
  const [formData, setFormData] = useState({}); // Changes frequently
  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children} {/* All children re-render on every keystroke */}
    </FormContext.Provider>
  );
}`;

const workaroundCode = `// ✅ Good: Zustand for high-frequency updates
import { create } from 'zustand';

const useFormStore = create((set) => ({
  formData: {},
  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value }
  })),
}));

// Only components using specific fields re-render
function FormField({ fieldName }) {
  const formData = useFormStore((state) => state.formData[fieldName]);
  const updateField = useFormStore((state) => state.updateField);
  // This component only re-renders when its specific field changes
}`;

export default function ContextHighFrequencyPage() {
  return (
    <AntiPatternLayout
      title="4. Context for High-Frequency Updates"
      description="Using Context API for frequently changing data (form inputs, live dashboards, real-time updates) causes performance issues."
      impact="Forces unnecessary re-renders of all consumers, severe performance bottlenecks, UI lag"
      antipatternCode={antipatternCode}
      workaroundCode={workaroundCode}
      antipatternExplanation="Context API causes all consumers to re-render when the context value changes. For high-frequency updates (like form inputs), this means every keystroke triggers re-renders across the entire tree."
      workaroundExplanation="Use subscription-based libraries like Zustand or Jotai for high-frequency state updates. These libraries use fine-grained subscriptions, so only components using specific fields re-render when those fields change."
    />
  );
}

