/**
 * Usage Example for Documentation-Driven Implementation System
 *
 * This example demonstrates how to use the system to implement code
 * strictly based on Context7/web search documentation references.
 */

const ExampleDrivenWorkflow = require('./example-driven-workflow');
const Context7Query = require('./context7-query');

async function demonstrateUsage() {
  // Initialize the workflow system
  const workflow = new ExampleDrivenWorkflow();

  // Example 1: Basic usage with simulated documentation
  console.log('=== Example 1: Basic Documentation-Driven Implementation ===\n');

  const task1 = 'Create a React component with useState hook for managing a counter';
  const documentation1 = {
    success: true,
    source: 'Context7',
    data: [
      {
        title: 'React useState Hook Documentation',
        content: `The useState Hook lets you add React state to function components.

Example:
\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

The useState hook returns an array with two elements:
1. The current state value
2. A function to update the state`,
        url: 'https://react.dev/reference/react/useState'
      },
      {
        title: 'React Function Components',
        content: `Function components are JavaScript functions that return JSX.

Example:
\`\`\`javascript
import React from 'react';

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

Always import React at the top of your component file.`
      }
    ]
  };

  const result1 = await workflow.executeWorkflow(task1, documentation1);
  console.log('Generated Template:');
  console.log(result1.result.template);
  console.log('\nValidation Score:', result1.result.validation.score);
  console.log('Overall Compliance:', result1.result.validation.compliance.overall + '%');

  // Example 2: Framework-specific workflow
  console.log('\n\n=== Example 2: Framework-Specific Implementation ===\n');

  const task2 = 'Create an async function to fetch data from an API endpoint';
  const documentation2 = {
    success: true,
    source: 'Web Search',
    data: [
      {
        title: 'JavaScript Async/Await Patterns',
        content: `Async/await is used to handle asynchronous operations in JavaScript.

Example:
\`\`\`javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
\`\`\`

Key points:
- Use try/catch for error handling
- Check response.ok before processing
- Use await for asynchronous operations`,
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'
      }
    ]
  };

  const result2 = await workflow.executeFrameworkWorkflow('node', task2, documentation2);
  console.log('Node.js-Specific Template:');
  console.log(result2.template);
  console.log('\nFramework Adaptations:', result2.frameworkAdaptations);

  // Example 3: Handling validation violations
  console.log('\n\n=== Example 3: Handling Validation Issues ===\n');

  const task3 = 'Create a custom React hook for localStorage';
  const problematicDocumentation = {
    success: true,
    source: 'Context7',
    data: [
      {
        title: 'Custom React Hooks',
        content: `Custom hooks let you extract component logic into reusable functions.

Example:
\`\`\`javascript
import { useState, useEffect } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}
\`\`\`

Custom hooks must start with 'use' and can call other hooks.`,
        url: 'https://react.dev/learn/reusing-logic-with-custom-hooks'
      }
    ]
  };

  const result3 = await workflow.executeWorkflow(task3, problematicDocumentation);

  if (!result3.result.success) {
    console.log('Validation Issues Found:');
    result3.result.validation.violations.forEach(violation => {
      console.log(`- ${violation.message} (Line: ${violation.line})`);
    });

    console.log('\nSuggestions:');
    result3.result.validation.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion.message}`);
    });
  }

  // Show workflow report
  console.log('\n\n=== Workflow System Report ===\n');
  const report = workflow.getWorkflowReport();
  console.log('Total Workflows:', report.totalWorkflows);
  console.log('Success Rate:', report.successRate.toFixed(1) + '%');
  console.log('Average Duration:', report.averageDuration + 'ms');

  return {
    basicResult: result1,
    frameworkResult: result2,
    validationResult: result3,
    report: report
  };
}

// Example integration with existing Context7 query system
async function integrateWithContext7(taskDescription) {
  console.log('\n=== Integration with Context7 Query System ===\n');

  // Initialize Context7 query system
  const context7Query = new Context7Query();
  const workflow = new ExampleDrivenWorkflow();

  try {
    // Step 1: Query Context7 for relevant documentation
    console.log('Querying Context7 for documentation...');
    const documentation = await context7Query.queryDocumentation(taskDescription);

    if (!documentation.success) {
      console.log('No documentation found. Using fallback approach...');
      return null;
    }

    console.log(`Found ${documentation.data.length} relevant documents`);

    // Step 2: Execute documentation-driven workflow
    console.log('Executing documentation-driven implementation workflow...');
    const result = await workflow.executeWorkflow(taskDescription, documentation);

    // Step 3: Display results
    console.log('\nGenerated Implementation:');
    console.log(result.result.template);

    console.log('\nValidation Results:');
    console.log(`Score: ${result.result.validation.score}/100`);
    console.log(`Compliance: ${result.result.validation.compliance.overall}%`);

    console.log('\nImplementation Guide:');
    console.log(result.result.guide.sections[0].content); // First section

    return result;

  } catch (error) {
    console.error('Error in Context7 integration:', error.message);
    return null;
  }
}

// Example usage in a real scenario
async function realWorldExample() {
  console.log('\n=== Real-World Example ===\n');

  const realTask = 'Implement a React form component with validation and submission handling';

  // Simulate documentation that might come from Context7
  const realDocumentation = {
    success: true,
    source: 'Context7',
    data: [
      {
        title: 'React Form Handling Patterns',
        content: `Forms in React use controlled components for state management.

Example:
\`\`\`javascript
import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
\`\`\``,
        url: 'https://react.dev/reference/react-dom/components/input'
      },
      {
        title: 'Form Validation in React',
        content: `Client-side validation prevents invalid form submissions.

Example:
\`\`\`javascript
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};

  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  }

  if (!formData.email.includes('@')) {
    newErrors.email = 'Invalid email format';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (validateForm()) {
    // Submit form
    console.log('Form is valid, submitting...');
  }
};
\`\`\``
      }
    ]
  };

  const workflow = new ExampleDrivenWorkflow();
  const result = await workflow.executeWorkflow(realTask, realDocumentation);

  console.log('Complex Implementation Result:');
  console.log('Success:', result.result.success);
  console.log('Template Complexity:', result.result.metadata.templateMetadata.complexity);
  console.log('Confidence Score:', Math.round(result.result.metadata.templateMetadata.confidenceScore * 100) + '%');

  // Show the implementation guide
  console.log('\nKey Implementation Steps:');
  result.result.guide.sections.forEach(section => {
    console.log(`\n${section.title}`);
    console.log(section.content.substring(0, 200) + '...');
  });

  return result;
}

// Run the examples
if (require.main === module) {
  (async () => {
    console.log('Documentation-Driven Implementation System Examples\n');
    console.log('=' .repeat(60));

    await demonstrateUsage();
    await integrateWithContext7('Create a custom React hook for API data fetching');
    await realWorldExample();

    console.log('\n' + '=' .repeat(60));
    console.log('Examples completed successfully!');
  })();
}

module.exports = {
  demonstrateUsage,
  integrateWithContext7,
  realWorldExample
};