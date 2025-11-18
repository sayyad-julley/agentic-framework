/**
 * Code Template Generator based on Documentation References
 *
 * This generator creates code templates strictly based on the fetched documentation
 * without using LLM's existing knowledge.
 */

class CodeTemplateGenerator {
  constructor(documentationImplementer) {
    this.implementer = documentationImplementer;
    this.templates = new Map();
  }

  /**
   * Generate code template for a specific task
   * @param {string} task - Description of the task to implement
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Generated template with metadata
   */
  generateTemplate(task, documentation) {
    // Set documentation reference in the implementer
    this.implementer.setDocumentationReference(documentation);

    // Generate implementation plan
    const plan = this.implementer.generateImplementationPlan(task);

    // Build template from plan
    const template = this.buildTemplateFromPlan(plan, task);

    return {
      task: task,
      template: template,
      metadata: {
        sourceDocumentation: this.extractDocumentationMetadata(documentation),
        patternCount: plan.relevantPatterns.length,
        stepCount: plan.steps.length,
        complexity: this.assessComplexity(plan),
        confidenceScore: this.calculateConfidenceScore(plan)
      }
    };
  }

  /**
   * Build code template from implementation plan
   * @param {Object} plan - Implementation plan
   * @param {string} task - Original task description
   * @returns {string} - Generated code template
   */
  buildTemplateFromPlan(plan, task) {
    const sections = [];

    // Header with documentation references
    sections.push(this.generateHeader(plan, task));

    // Imports section
    const importsSection = this.generateImportsSection(plan.requiredImports);
    if (importsSection) {
      sections.push(importsSection);
    }

    // Main implementation section
    const implementationSection = this.generateImplementationSection(plan.steps);
    sections.push(implementationSection);

    // Documentation comments section
    sections.push(this.generateDocumentationSection(plan));

    // Validation section (comments)
    sections.push(this.generateValidationSection(plan));

    return sections.join('\n\n');
  }

  /**
   * Generate header section
   * @param {Object} plan - Implementation plan
   * @param {string} task - Task description
   * @returns {string} - Header section
   */
  generateHeader(plan, task) {
    const timestamp = new Date().toISOString();
    const docSource = plan.documentationSource?.source || 'Unknown';

    return `/**
 * Auto-generated implementation based on documentation
 * Task: ${task}
 * Generated: ${timestamp}
 * Documentation Source: ${docSource}
 *
 * This code is generated strictly from the provided documentation references
 * without using external knowledge or assumptions.
 */`;
  }

  /**
   * Generate imports section
   * @param {Array<string>} imports - Required imports
   * @returns {string} - Imports section
   */
  generateImportsSection(imports) {
    if (!imports || imports.length === 0) {
      return '';
    }

    const uniqueImports = [...new Set(imports)];
    const importStatements = uniqueImports.map(imp => {
      if (imp.includes('require')) {
        return imp.endsWith(';') ? imp : `${imp};`;
      } else if (imp.includes('import')) {
        return imp.endsWith(';') ? imp : `${imp};`;
      }
      return imp;
    });

    return `// Required imports (from documentation examples)
${importStatements.join('\n')}`;
  }

  /**
   * Generate main implementation section
   * @param {Array<Object>} steps - Implementation steps
   * @returns {string} - Implementation section
   */
  generateImplementationSection(steps) {
    const implementationSteps = steps.filter(step =>
      step.type !== 'imports' && step.type !== 'documentation'
    );

    if (implementationSteps.length === 0) {
      return `// No specific implementation patterns found in documentation
// Please refer to the documentation source for implementation guidance`;
    }

    const sections = [];

    implementationSteps.forEach((step, index) => {
      const stepHeader = this.generateStepHeader(step, index + 1);
      const stepCode = this.adaptCodeFromPattern(step);

      sections.push(`${stepHeader}
${stepCode}`);
    });

    return sections.join('\n\n');
  }

  /**
   * Generate step header
   * @param {Object} step - Implementation step
   * @param {number} stepNumber - Step number
   * @returns {string} - Step header comment
   */
  generateStepHeader(step, stepNumber) {
    const relevanceInfo = step.relevance ? ` (Relevance: ${step.relevance})` : '';
    return `// Step ${stepNumber}: ${step.description}${relevanceInfo}
// Source: ${step.source}`;
  }

  /**
   * Adapt code from documentation pattern
   * @param {Object} step - Implementation step with code pattern
   * @returns {string} - Adapted code
   */
  adaptCodeFromPattern(step) {
    let code = step.code;

    if (step.type === 'function') {
      code = this.adaptFunctionPattern(code);
    } else if (step.type === 'configuration') {
      code = this.adaptConfigurationPattern(code);
    } else {
      code = this.adaptGenericPattern(code);
    }

    return code;
  }

  /**
   * Adapt function pattern
   * @param {string} code - Function code from documentation
   * @returns {string} - Adapted function code
   */
  adaptFunctionPattern(code) {
    // Add placeholder comments for customization
    const lines = code.split('\n');
    const adaptedLines = [];

    lines.forEach(line => {
      adaptedLines.push(line);

      // Add implementation placeholder after opening brace
      if (line.includes('{') && !line.includes('}')) {
        const indent = line.match(/^(\s*)/)[1];
        adaptedLines.push(`${indent}  // TODO: Implement based on documentation examples`);
      }
    });

    return adaptedLines.join('\n');
  }

  /**
   * Adapt configuration pattern
   * @param {string} code - Configuration code from documentation
   * @returns {string} - Adapted configuration code
   */
  adaptConfigurationPattern(code) {
    // Add placeholder values for configuration properties
    return code + '\n// TODO: Configure values based on documentation requirements';
  }

  /**
   * Adapt generic pattern
   * @param {string} code - Generic code pattern
   * @returns {string} - Adapted code
   */
  adaptGenericPattern(code) {
    return `${code}
// TODO: Customize based on documentation examples and requirements`;
  }

  /**
   * Generate documentation section
   * @param {Object} plan - Implementation plan
   * @returns {string} - Documentation section
   */
  generateDocumentationSection(plan) {
    const docRefs = [];

    if (plan.documentationSource && plan.documentationSource.data) {
      plan.documentationSource.data.forEach((doc, index) => {
        docRefs.push(` * @reference ${index + 1}: ${doc.title}`);
        if (doc.url) {
          docRefs.push(` * @source ${index + 1}: ${doc.url}`);
        }
      });
    }

    return `/*
 * Documentation References:
${docRefs.join('\n')}
 */`;
  }

  /**
   * Generate validation section
   * @param {Object} plan - Implementation plan
   * @returns {string} - Validation section
   */
  generateValidationSection(plan) {
    const validations = [];

    // Validate imports
    if (plan.requiredImports.length > 0) {
      validations.push('// Validate: Ensure all required imports are available');
    }

    // Validate dependencies
    if (plan.requiredDependencies.length > 0) {
      validations.push(`// Validate: Ensure dependencies are available: ${plan.requiredDependencies.join(', ')}`);
    }

    // Validate patterns
    if (plan.relevantPatterns.length > 0) {
      validations.push(`// Validate: Ensure ${plan.relevantPatterns.length} documented patterns are properly implemented`);
    }

    return `// Implementation Validation Checklist:
${validations.join('\n')}

// Post-implementation Steps:
// 1. Test the implementation against documentation examples
// 2. Validate all imports and dependencies
// 3. Compare behavior with documented examples
// 4. Add error handling as shown in documentation`;
  }

  /**
   * Extract metadata from documentation
   * @param {Object} documentation - Documentation object
   * @returns {Object} - Documentation metadata
   */
  extractDocumentationMetadata(documentation) {
    if (!documentation || !documentation.data) {
      return {
        source: 'Unknown',
        documentCount: 0,
        success: false
      };
    }

    return {
      source: documentation.source || 'Context7/Web Search',
      documentCount: documentation.data.length,
      success: documentation.success || false,
      titles: documentation.data.map(doc => doc.title).filter(Boolean),
      urls: documentation.data.map(doc => doc.url).filter(Boolean)
    };
  }

  /**
   * Assess implementation complexity
   * @param {Object} plan - Implementation plan
   * @returns {string} - Complexity level (low, medium, high)
   */
  assessComplexity(plan) {
    let complexityScore = 0;

    // Score based on number of patterns
    complexityScore += plan.relevantPatterns.length * 2;

    // Score based on number of steps
    complexityScore += plan.steps.length;

    // Score based on required imports
    complexityScore += plan.requiredImports.length;

    // Score based on dependencies
    complexityScore += plan.requiredDependencies.length;

    if (complexityScore <= 5) return 'low';
    if (complexityScore <= 12) return 'medium';
    return 'high';
  }

  /**
   * Calculate confidence score for generated template
   * @param {Object} plan - Implementation plan
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidenceScore(plan) {
    if (!plan.documentationSource || !plan.documentationSource.success) {
      return 0.1;
    }

    let confidence = 0.5; // Base confidence

    // Boost confidence based on relevant patterns
    const patternBoost = Math.min(plan.relevantPatterns.length * 0.15, 0.4);
    confidence += patternBoost;

    // Reduce confidence based on missing information
    if (plan.requiredDependencies.length > 3) {
      confidence -= 0.1;
    }

    if (plan.relevantPatterns.length === 0) {
      confidence = 0.2;
    }

    return Math.min(Math.max(confidence, 0), 1);
  }

  /**
   * Generate specialized template for specific framework/library
   * @param {string} framework - Framework name (react, vue, angular, etc.)
   * @param {string} task - Task description
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Specialized template
   */
  generateFrameworkTemplate(framework, task, documentation) {
    const baseTemplate = this.generateTemplate(task, documentation);

    // Add framework-specific adaptations
    const frameworkSpecificCode = this.getFrameworkSpecificAdaptations(framework, documentation);

    return {
      ...baseTemplate,
      template: this.insertFrameworkSpecificCode(baseTemplate.template, frameworkSpecificCode),
      framework: framework,
      frameworkAdaptations: frameworkSpecificCode
    };
  }

  /**
   * Get framework-specific adaptations
   * @param {string} framework - Framework name
   * @param {Object} documentation - Documentation reference
   * @returns {Array<string>} - Framework-specific code additions
   */
  getFrameworkSpecificAdaptations(framework, documentation) {
    const adaptations = [];

    switch (framework.toLowerCase()) {
      case 'react':
        adaptations.push('// React-specific imports and patterns');
        adaptations.push('import React from "react";');
        adaptations.push('// Use React hooks as shown in documentation');
        break;

      case 'vue':
        adaptations.push('// Vue-specific imports and patterns');
        adaptations.push('// Use Vue 3 Composition API as documented');
        break;

      case 'angular':
        adaptations.push('// Angular-specific imports and patterns');
        adaptations.push('import { Component, OnInit } from "@angular/core";');
        break;

      case 'node':
        adaptations.push('// Node.js specific patterns');
        adaptations.push('// Use async/await patterns from documentation');
        break;
    }

    return adaptations;
  }

  /**
   * Insert framework-specific code into template
   * @param {string} template - Base template
   * @param {Array<string>} frameworkCode - Framework-specific code
   * @returns {string} - Modified template
   */
  insertFrameworkSpecificCode(template, frameworkCode) {
    if (frameworkCode.length === 0) {
      return template;
    }

    const lines = template.split('\n');
    const insertIndex = this.findBestInsertionPoint(lines);

    // Insert framework-specific code
    lines.splice(insertIndex, 0, '', ...frameworkCode, '');

    return lines.join('\n');
  }

  /**
   * Find best insertion point in template
   * @param {Array<string>} lines - Template lines
   * @returns {number} - Index to insert code
   */
  findBestInsertionPoint(lines) {
    // Look for imports section end
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Required imports') || lines[i].includes('import')) {
        // Continue to the end of imports
        while (i < lines.length && (lines[i].includes('import') || lines[i].includes('require') || lines[i].trim() === '' || lines[i].includes('//'))) {
          i++;
        }
        return i;
      }
    }

    // Default to after header
    return this.findHeaderEnd(lines) + 1;
  }

  /**
   * Find end of header section
   * @param {Array<string>} lines - Template lines
   * @returns {number} - Header end index
   */
  findHeaderEnd(lines) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('*/')) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Get template generation report
   * @returns {Object} - Generation report
   */
  getGenerationReport() {
    return {
      implementerReport: this.implementer.getImplementationReport(),
      templatesGenerated: this.templates.size,
      supportedFrameworks: ['react', 'vue', 'angular', 'node', 'vanilla'],
      lastGenerated: new Date().toISOString()
    };
  }
}

module.exports = CodeTemplateGenerator;