/**
 * Example-Driven Implementation Workflow
 *
 * This workflow orchestrates the entire process of using documentation references
 * to implement code without relying on LLM's existing knowledge.
 */

const DocumentationDrivenImplementer = require('./documentation-driven-implementer');
const CodeTemplateGenerator = require('./code-template-generator');
const DocumentationValidator = require('./documentation-validator');

class ExampleDrivenWorkflow {
  constructor() {
    this.implementer = new DocumentationDrivenImplementer();
    this.generator = new CodeTemplateGenerator(this.implementer);
    this.validator = new DocumentationValidator();
    this.workflows = new Map();
  }

  /**
   * Execute complete documentation-driven implementation workflow
   * @param {string} task - Task description to implement
   * @param {Object} documentation - Documentation reference from Context7/web search
   * @param {Object} options - Workflow options
   * @returns {Object} - Complete workflow result
   */
  async executeWorkflow(task, documentation, options = {}) {
    const workflowId = this.generateWorkflowId();
    const workflowStart = new Date();

    const workflow = {
      id: workflowId,
      task: task,
      documentation: documentation,
      options: { ...options },
      startTime: workflowStart.toISOString(),
      steps: [],
      result: null,
      status: 'running'
    };

    this.workflows.set(workflowId, workflow);

    try {
      // Step 1: Validate documentation input
      await this.executeStep(workflow, 'validate_documentation', () => {
        return this.validateDocumentationInput(documentation);
      });

      // Step 2: Generate implementation plan
      const implementationPlan = await this.executeStep(workflow, 'generate_plan', () => {
        return this.implementer.generateImplementationPlan(task);
      });

      // Step 3: Generate code template
      const templateResult = await this.executeStep(workflow, 'generate_template', () => {
        return this.generator.generateTemplate(task, documentation);
      });

      // Step 4: Validate generated template
      const validationResult = await this.executeStep(workflow, 'validate_template', () => {
        return this.validator.validateCode(templateResult.template, documentation);
      });

      // Step 5: Generate implementation guide
      const implementationGuide = await this.executeStep(workflow, 'generate_guide', () => {
        return this.generateImplementationGuide(implementationPlan, templateResult, validationResult);
      });

      // Step 6: Create final workflow result
      const finalResult = await this.executeStep(workflow, 'finalize_result', () => {
        return this.createFinalResult(templateResult, validationResult, implementationGuide);
      });

      workflow.result = finalResult;
      workflow.status = 'completed';
      workflow.endTime = new Date().toISOString();

      // Calculate workflow duration
      const duration = new Date(workflow.endTime) - new Date(workflow.startTime);
      workflow.duration = `${duration}ms`;

    } catch (error) {
      workflow.status = 'failed';
      workflow.error = {
        message: error.message,
        stack: error.stack,
        step: workflow.steps.length
      };
      workflow.endTime = new Date().toISOString();
    }

    return workflow;
  }

  /**
   * Execute a workflow step with error handling
   * @param {Object} workflow - Workflow object
   * @param {string} stepName - Name of the step
   * @param {Function} stepFunction - Step function to execute
   * @returns {*} - Step result
   */
  async executeStep(workflow, stepName, stepFunction) {
    const stepStart = new Date();
    const step = {
      name: stepName,
      startTime: stepStart.toISOString(),
      status: 'running'
    };

    try {
      const result = await stepFunction();
      step.result = result;
      step.status = 'completed';
      step.endTime = new Date().toISOString();

      const duration = new Date(step.endTime) - new Date(step.startTime);
      step.duration = `${duration}ms`;

      workflow.steps.push(step);
      return result;

    } catch (error) {
      step.status = 'failed';
      step.error = error.message;
      step.endTime = new Date().toISOString();
      workflow.steps.push(step);
      throw error;
    }
  }

  /**
   * Validate documentation input
   * @param {Object} documentation - Documentation to validate
   * @returns {Object} - Validation result
   */
  validateDocumentationInput(documentation) {
    const validation = {
      isValid: true,
      issues: [],
      summary: {}
    };

    if (!documentation) {
      validation.isValid = false;
      validation.issues.push('No documentation provided');
      return validation;
    }

    // Check for required fields
    if (!documentation.success) {
      validation.issues.push('Documentation query was not successful');
    }

    if (!documentation.data || documentation.data.length === 0) {
      validation.issues.push('No documentation data available');
      validation.isValid = false;
    }

    // Check data quality
    if (documentation.data) {
      const validDocs = documentation.data.filter(doc =>
        doc.content && doc.content.length > 50
      );

      validation.summary = {
        totalDocuments: documentation.data.length,
        validDocuments: validDocs.length,
        contentQuality: validDocs.length / documentation.data.length
      };

      if (validation.summary.contentQuality < 0.3) {
        validation.issues.push('Low content quality in documentation');
        validation.isValid = false;
      }
    }

    return validation;
  }

  /**
   * Generate implementation guide
   * @param {Object} implementationPlan - Implementation plan
   * @param {Object} templateResult - Template generation result
   * @param {Object} validationResult - Validation result
   * @returns {Object} - Implementation guide
   */
  generateImplementationGuide(implementationPlan, templateResult, validationResult) {
    return {
      title: 'Implementation Guide Based on Documentation',
      description: 'Step-by-step guide to implement using only the provided documentation',
      sections: [
        {
          title: '1. Understanding the Documentation',
          content: this.generateDocumentationUnderstanding(implementationPlan),
          priority: 'high'
        },
        {
          title: '2. Code Template Analysis',
          content: this.generateTemplateAnalysis(templateResult),
          priority: 'high'
        },
        {
          title: '3. Validation Results',
          content: this.generateValidationAnalysis(validationResult),
          priority: 'high'
        },
        {
          title: '4. Implementation Steps',
          content: this.generateImplementationSteps(implementationPlan, templateResult),
          priority: 'medium'
        },
        {
          title: '5. Post-Implementation Checklist',
          content: this.generatePostImplementationChecklist(validationResult),
          priority: 'medium'
        }
      ],
      warnings: validationResult.warnings || [],
      suggestions: validationResult.suggestions || []
    };
  }

  /**
   * Generate documentation understanding section
   * @param {Object} implementationPlan - Implementation plan
   * @returns {string} - Documentation understanding content
   */
  generateDocumentationUnderstanding(implementationPlan) {
    const docs = implementationPlan.documentationSource;
    if (!docs || !docs.data) {
      return 'No documentation available for analysis.';
    }

    let content = `Based on the provided documentation:\n\n`;

    docs.data.forEach((doc, index) => {
      content += `**Document ${index + 1}: ${doc.title || 'Untitled'}**\n`;
      if (doc.url) {
        content += `Source: ${doc.url}\n`;
      }
      content += `Content preview: ${doc.content.substring(0, 200)}...\n\n`;
    });

    content += `Key insights:\n`;
    content += `- Found ${implementationPlan.relevantPatterns.length} relevant code patterns\n`;
    content += `- Identified ${implementationPlan.requiredImports.length} required imports\n`;
    content += `- Recognized ${implementationPlan.requiredDependencies.length} dependencies\n\n`;

    return content;
  }

  /**
   * Generate template analysis section
   * @param {Object} templateResult - Template result
   * @returns {string} - Template analysis content
   */
  generateTemplateAnalysis(templateResult) {
    let content = `Generated code template analysis:\n\n`;

    content += `**Complexity Level:** ${templateResult.metadata.complexity}\n`;
    content += `**Confidence Score:** ${Math.round(templateResult.metadata.confidenceScore * 100)}%\n`;
    content += `**Patterns Used:** ${templateResult.metadata.patternCount}\n`;
    content += `**Implementation Steps:** ${templateResult.metadata.stepCount}\n\n`;

    if (templateResult.metadata.sourceDocumentation) {
      content += `**Documentation Sources:**\n`;
      const sources = templateResult.metadata.sourceDocumentation;
      content += `- Total documents: ${sources.documentCount}\n`;
      content += `- Source: ${sources.source}\n`;
      if (sources.titles && sources.titles.length > 0) {
        content += `- Key documents: ${sources.titles.slice(0, 3).join(', ')}\n`;
      }
    }

    return content;
  }

  /**
   * Generate validation analysis section
   * @param {Object} validationResult - Validation result
   * @returns {string} - Validation analysis content
   */
  generateValidationAnalysis(validationResult) {
    let content = `Validation results:\n\n`;

    content += `**Overall Valid:** ${validationResult.isValid ? '✅ Yes' : '❌ No'}\n`;
    content += `**Validation Score:** ${validationResult.score}/100\n\n`;

    content += `**Compliance Breakdown:**\n`;
    content += `- Documentation Compliance: ${validationResult.compliance.documentation}%\n`;
    content += `- Pattern Compliance: ${validationResult.compliance.patterns}%\n`;
    content += `- Import Compliance: ${validationResult.compliance.imports}%\n`;
    content += `- Overall Compliance: ${validationResult.compliance.overall}%\n\n`;

    if (validationResult.violations.length > 0) {
      content += `**Critical Issues (${validationResult.violations.length}):**\n`;
      validationResult.violations.forEach((violation, index) => {
        content += `${index + 1}. ${violation.message}`;
        if (violation.line) {
          content += ` (Line ${violation.line})`;
        }
        content += '\n';
      });
      content += '\n';
    }

    if (validationResult.warnings.length > 0) {
      content += `**Warnings (${validationResult.warnings.length}):**\n`;
      validationResult.warnings.forEach((warning, index) => {
        content += `${index + 1}. ${warning.message}`;
        if (warning.line) {
          content += ` (Line ${warning.line})`;
        }
        content += '\n';
      });
      content += '\n';
    }

    return content;
  }

  /**
   * Generate implementation steps section
   * @param {Object} implementationPlan - Implementation plan
   * @param {Object} templateResult - Template result
   * @returns {string} - Implementation steps content
   */
  generateImplementationSteps(implementationPlan, templateResult) {
    let content = `Follow these steps to implement the code:\n\n`;

    implementationPlan.steps.forEach((step, index) => {
      content += `**Step ${index + 1}: ${step.description}**\n`;
      content += `Type: ${step.type}\n`;
      content += `Source: ${step.source}\n`;

      if (step.code) {
        content += `Code Example:\n\`\`\`\n${step.code}\n\`\`\`\n`;
      }

      content += '\n';
    });

    content += `**Important Notes:**\n`;
    content += `- Only use the patterns and code shown in the documentation examples\n`;
    content += `- Do not introduce concepts or functions not documented\n`;
    content += `- Follow the exact syntax and structure from the examples\n`;
    content += `- Test your implementation against the documented examples\n`;

    return content;
  }

  /**
   * Generate post-implementation checklist
   * @param {Object} validationResult - Validation result
   * @returns {string} - Post-implementation checklist content
   */
  generatePostImplementationChecklist(validationResult) {
    let content = `After implementation, verify:\n\n`;

    content += `**Functionality Checklist:**\n`;
    content += `- [ ] Code follows documented patterns exactly\n`;
    content += `- [ ] All required imports are present\n`;
    content += `- [ ] No undocumented functions or concepts are used\n`;
    content += `- [ ] Implementation matches documentation examples\n\n`;

    content += `**Quality Checklist:**\n`;
    content += `- [ ] Code passes all validation rules\n`;
    content += `- [ ] No critical validation violations\n`;
    content += `- [ ] All warnings have been addressed or acknowledged\n`;
    content += `- [ ] Code is well-commented with documentation references\n\n`;

    content += `**Testing Checklist:**\n`;
    content += `- [ ] Implementation works with documented examples\n`;
    content += `- [ ] Error handling matches documentation patterns\n`;
    content += `- [ ] Dependencies are properly resolved\n`;
    content += `- [ ] Performance matches documented expectations\n\n`;

    if (validationResult.violations.length > 0) {
      content += `**Required Actions:**\n`;
      validationResult.violations.forEach(violation => {
        content += `- Fix: ${violation.message}\n`;
      });
      content += '\n';
    }

    return content;
  }

  /**
   * Create final workflow result
   * @param {Object} templateResult - Template generation result
   * @param {Object} validationResult - Validation result
   * @param {Object} implementationGuide - Implementation guide
   * @returns {Object} - Final result
   */
  createFinalResult(templateResult, validationResult, implementationGuide) {
    return {
      success: validationResult.isValid,
      template: templateResult.template,
      validation: validationResult,
      guide: implementationGuide,
      metadata: {
        templateMetadata: templateResult.metadata,
        validationMetadata: validationResult.metadata,
        generatedAt: new Date().toISOString()
      },
      nextSteps: this.generateNextSteps(validationResult),
      recommendations: this.generateRecommendations(validationResult, templateResult)
    };
  }

  /**
   * Generate next steps based on validation
   * @param {Object} validationResult - Validation result
   * @returns {Array<string>} - Next steps
   */
  generateNextSteps(validationResult) {
    const steps = [];

    if (validationResult.violations.length > 0) {
      steps.push('Fix all critical validation violations before proceeding');
    }

    if (validationResult.warnings.length > 0) {
      steps.push('Review and address validation warnings');
    }

    steps.push('Implement the code following the generated template');
    steps.push('Test implementation against documentation examples');
    steps.push('Run final validation on completed implementation');

    if (validationResult.compliance.overall < 80) {
      steps.push('Consider reviewing additional documentation for better coverage');
    }

    return steps;
  }

  /**
   * Generate recommendations
   * @param {Object} validationResult - Validation result
   * @param {Object} templateResult - Template result
   * @returns {Array<string>} - Recommendations
   */
  generateRecommendations(validationResult, templateResult) {
    const recommendations = [];

    if (validationResult.compliance.documentation < 70) {
      recommendations.push('Consider fetching more specific documentation for better pattern matching');
    }

    if (templateResult.metadata.confidenceScore < 0.6) {
      recommendations.push('Low confidence score - verify implementation carefully against documentation');
    }

    if (validationResult.violations.length === 0 && validationResult.warnings.length === 0) {
      recommendations.push('Excellent adherence to documentation - ready for implementation');
    }

    recommendations.push('Always cross-reference with the original documentation sources');
    recommendations.push('Keep documentation references in code comments for future maintenance');

    return recommendations;
  }

  /**
   * Execute framework-specific workflow
   * @param {string} framework - Framework name
   * @param {string} task - Task description
   * @param {Object} documentation - Documentation reference
   * @param {Object} options - Workflow options
   * @returns {Object} - Framework-specific workflow result
   */
  async executeFrameworkWorkflow(framework, task, documentation, options = {}) {
    // Generate framework-specific template
    const templateResult = this.generator.generateFrameworkTemplate(framework, task, documentation);

    // Validate the framework-specific template
    const validationResult = this.validator.validateCode(templateResult.template, documentation);

    // Generate framework-specific implementation guide
    const frameworkGuide = this.generateFrameworkImplementationGuide(framework, templateResult, validationResult);

    return {
      framework: framework,
      task: task,
      template: templateResult.template,
      validation: validationResult,
      guide: frameworkGuide,
      frameworkAdaptations: templateResult.frameworkAdaptations,
      metadata: {
        ...templateResult.metadata,
        framework: framework
      }
    };
  }

  /**
   * Generate framework-specific implementation guide
   * @param {string} framework - Framework name
   * @param {Object} templateResult - Template result
   * @param {Object} validationResult - Validation result
   * @returns {Object} - Framework-specific guide
   */
  generateFrameworkImplementationGuide(framework, templateResult, validationResult) {
    const baseGuide = this.generateImplementationGuide(
      { relevantPatterns: [], requiredImports: [], requiredDependencies: [] },
      templateResult,
      validationResult
    );

    // Add framework-specific sections
    const frameworkSection = {
      title: `${framework.charAt(0).toUpperCase() + framework.slice(1)}-Specific Considerations`,
      content: this.getFrameworkSpecificGuidance(framework),
      priority: 'high'
    };

    baseGuide.sections.unshift(frameworkSection);

    return baseGuide;
  }

  /**
   * Get framework-specific guidance
   * @param {string} framework - Framework name
   * @returns {string} - Framework guidance
   */
  getFrameworkSpecificGuidance(framework) {
    const guidance = {
      react: 'React Specific:\n- Use functional components with hooks as documented\n- Follow React naming conventions\n- Ensure proper JSX syntax\n- Manage state with useState/useEffect patterns from documentation',

      vue: 'Vue Specific:\n- Use Vue 3 Composition API if documented\n- Follow Vue template syntax\n- Implement reactive data patterns as shown\n- Use proper Vue component structure',

      angular: 'Angular Specific:\n- Use TypeScript as documented\n- Follow Angular component architecture\n- Implement proper dependency injection\n- Use RxJS patterns if documented',

      node: 'Node.js Specific:\n- Use CommonJS or ES modules as documented\n- Follow async/await patterns\n- Implement proper error handling\n- Use event-driven patterns if shown in docs'
    };

    return guidance[framework.toLowerCase()] || 'Follow general best practices and documented patterns.';
  }

  /**
   * Generate workflow ID
   * @returns {string} - Unique workflow ID
   */
  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get workflow status
   * @param {string} workflowId - Workflow ID
   * @returns {Object|null} - Workflow status
   */
  getWorkflowStatus(workflowId) {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Get all workflows
   * @returns {Array<Object>} - All workflows
   */
  getAllWorkflows() {
    return Array.from(this.workflows.values());
  }

  /**
   * Clear completed workflows
   */
  clearCompletedWorkflows() {
    for (const [id, workflow] of this.workflows) {
      if (workflow.status === 'completed' || workflow.status === 'failed') {
        this.workflows.delete(id);
      }
    }
  }

  /**
   * Get workflow report
   * @returns {Object} - Workflow system report
   */
  getWorkflowReport() {
    const workflows = this.getAllWorkflows();
    const completed = workflows.filter(w => w.status === 'completed');
    const failed = workflows.filter(w => w.status === 'failed');
    const running = workflows.filter(w => w.status === 'running');

    return {
      totalWorkflows: workflows.length,
      completedWorkflows: completed.length,
      failedWorkflows: failed.length,
      runningWorkflows: running.length,
      averageDuration: this.calculateAverageDuration(completed),
      successRate: workflows.length > 0 ? (completed.length / workflows.length) * 100 : 0,
      systemReport: {
        implementer: this.implementer.getImplementationReport(),
        generator: this.generator.getGenerationReport(),
        validator: this.validator.getValidationReport()
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate average workflow duration
   * @param {Array<Object>} completedWorkflows - Completed workflows
   * @returns {number} - Average duration in milliseconds
   */
  calculateAverageDuration(completedWorkflows) {
    if (completedWorkflows.length === 0) return 0;

    const durations = completedWorkflows
      .filter(w => w.duration)
      .map(w => parseInt(w.duration.replace('ms', '')));

    return durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;
  }
}

module.exports = ExampleDrivenWorkflow;