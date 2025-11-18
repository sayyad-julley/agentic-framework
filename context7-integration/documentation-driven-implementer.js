/**
 * Documentation-Driven Code Implementation System
 *
 * This system uses fetched documentation (Context7/web search) as the primary source
 * for implementing code without relying on LLM's existing knowledge.
 */

class DocumentationDrivenImplementer {
  constructor() {
    this.codePatterns = new Map();
    this.documentationReference = null;
    this.implementationSteps = [];
  }

  /**
   * Set the documentation reference for implementation
   * @param {Object} documentation - Fetched documentation from Context7/web search
   */
  setDocumentationReference(documentation) {
    this.documentationReference = documentation;
    this.extractCodePatterns();
  }

  /**
   * Extract code patterns from documentation
   */
  extractCodePatterns() {
    if (!this.documentationReference || !this.documentationReference.data) {
      return;
    }

    const docs = this.documentationReference.data;

    docs.forEach(doc => {
      // Extract code blocks from content
      const codeBlocks = this.extractCodeBlocks(doc.content);
      codeBlocks.forEach(block => {
        const pattern = this.analyzeCodePattern(block);
        if (pattern) {
          this.codePatterns.set(pattern.signature, pattern);
        }
      });
    });
  }

  /**
   * Extract code blocks from text content
   * @param {string} content - Documentation content
   * @returns {Array<string>} - Array of code blocks
   */
  extractCodeBlocks(content) {
    const codeBlocks = [];

    // Match markdown code blocks
    const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push(match[1].trim());
    }

    // Match inline code examples
    const inlineCodeRegex = /`([^`]+)`/g;
    while ((match = inlineCodeRegex.exec(content)) !== null) {
      if (match[1].includes('(') || match[1].includes('{') || match[1].length > 10) {
        codeBlocks.push(match[1]);
      }
    }

    return codeBlocks;
  }

  /**
   * Analyze code pattern and extract structure
   * @param {string} codeBlock - Code block to analyze
   * @returns {Object|null} - Pattern analysis result
   */
  analyzeCodePattern(codeBlock) {
    if (!codeBlock || codeBlock.length < 10) return null;

    const lines = codeBlock.split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    // Identify function/class patterns
    const functionMatch = codeBlock.match(/(?:function\s+(\w+)|(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)|class\s+(\w+)|(\w+)\s*\([^)]*\)\s*[{:]|const\s+(\w+)\s*=\s*\{)/);

    if (functionMatch) {
      const name = functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4] || functionMatch[5];
      const signature = this.extractFunctionSignature(codeBlock);

      return {
        type: 'function',
        name: name,
        signature: signature || codeBlock.split('\n')[0].trim(),
        fullCode: codeBlock,
        parameters: this.extractParameters(codeBlock),
        returnType: this.extractReturnType(codeBlock),
        imports: this.extractImports(codeBlock),
        dependencies: this.extractDependencies(codeBlock)
      };
    }

    // Identify configuration/object patterns
    const configMatch = codeBlock.match(/(?:const|let|var)\s+(\w+)\s*=\s*\{/);
    if (configMatch) {
      return {
        type: 'configuration',
        name: configMatch[1],
        signature: configMatch[0],
        fullCode: codeBlock,
        properties: this.extractObjectProperties(codeBlock),
        imports: this.extractImports(codeBlock)
      };
    }

    // Return generic pattern if no specific match
    return {
      type: 'generic',
      signature: lines[0].trim(),
      fullCode: codeBlock,
      imports: this.extractImports(codeBlock)
    };
  }

  /**
   * Extract function signature from code block
   * @param {string} codeBlock - Code block
   * @returns {string|null} - Function signature
   */
  extractFunctionSignature(codeBlock) {
    const lines = codeBlock.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('function') || trimmed.includes('=') || trimmed.includes('=>') || trimmed.includes('{')) {
        const signatureMatch = trimmed.match(/^(.*?)(?=\s*[{:])/);
        return signatureMatch ? signatureMatch[1].trim() : trimmed;
      }
    }
    return null;
  }

  /**
   * Extract parameters from function signature
   * @param {string} codeBlock - Code block
   * @returns {Array<string>} - Array of parameter names
   */
  extractParameters(codeBlock) {
    const paramMatch = codeBlock.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];

    return paramMatch[1]
      .split(',')
      .map(param => param.trim().split('=')[0].trim())
      .filter(param => param && !param.includes('...'));
  }

  /**
   * Extract return type information
   * @param {string} codeBlock - Code block
   * @returns {string|null} - Return type
   */
  extractReturnType(codeBlock) {
    // TypeScript return type
    const tsMatch = codeBlock.match(/:\s*(\w+(?:<[^>]+>)?(?:\[\])?)\s*[({]/);
    if (tsMatch) return tsMatch[1];

    // JSDoc return type
    const jsDocMatch = codeBlock.match(/@returns?\s*{([^}]+)}/);
    if (jsDocMatch) return jsDocMatch[1];

    return null;
  }

  /**
   * Extract imports from code block
   * @param {string} codeBlock - Code block
   * @returns {Array<string>} - Array of import statements
   */
  extractImports(codeBlock) {
    const imports = [];
    const importRegex = /(?:import|require)\s*\([^)]*\)|import\s+.*?from\s+['"][^'"]+['"]/g;

    let match;
    while ((match = importRegex.exec(codeBlock)) !== null) {
      imports.push(match[0]);
    }

    return imports;
  }

  /**
   * Extract dependencies from code block
   * @param {string} codeBlock - Code block
   * @returns {Array<string>} - Array of dependency identifiers
   */
  extractDependencies(codeBlock) {
    const dependencies = new Set();

    // Look for object property access and method calls
    const dependencyRegex = /(\w+)\./g;
    let match;

    while ((match = dependencyRegex.exec(codeBlock)) !== null) {
      const dep = match[1];
      if (!['console', 'window', 'document', 'global'].includes(dep)) {
        dependencies.add(dep);
      }
    }

    return Array.from(dependencies);
  }

  /**
   * Extract object properties
   * @param {string} codeBlock - Code block containing object
   * @returns {Array<string>} - Array of property names
   */
  extractObjectProperties(codeBlock) {
    const properties = [];
    const propRegex = /(\w+)\s*:/g;
    let match;

    while ((match = propRegex.exec(codeBlock)) !== null) {
      properties.push(match[1]);
    }

    return properties;
  }

  /**
   * Generate implementation plan based on documentation
   * @param {string} taskDescription - Description of what to implement
   * @returns {Object} - Implementation plan
   */
  generateImplementationPlan(taskDescription) {
    const relevantPatterns = this.findRelevantPatterns(taskDescription);

    const plan = {
      task: taskDescription,
      documentationSource: this.documentationReference,
      relevantPatterns: relevantPatterns,
      steps: this.generateImplementationSteps(relevantPatterns),
      requiredImports: this.collectRequiredImports(relevantPatterns),
      requiredDependencies: this.collectRequiredDependencies(relevantPatterns)
    };

    this.implementationSteps = plan.steps;
    return plan;
  }

  /**
   * Find code patterns relevant to the task
   * @param {string} taskDescription - Task description
   * @returns {Array<Object>} - Relevant patterns
   */
  findRelevantPatterns(taskDescription) {
    const taskKeywords = this.extractKeywords(taskDescription);
    const relevantPatterns = [];

    for (const [signature, pattern] of this.codePatterns) {
      let relevanceScore = 0;

      // Score based on keyword matching
      for (const keyword of taskKeywords) {
        if (pattern.fullCode.toLowerCase().includes(keyword.toLowerCase())) {
          relevanceScore += 2;
        }
        if (signature.toLowerCase().includes(keyword.toLowerCase())) {
          relevanceScore += 3;
        }
        if (pattern.name && pattern.name.toLowerCase().includes(keyword.toLowerCase())) {
          relevanceScore += 4;
        }
      }

      if (relevanceScore > 0) {
        relevantPatterns.push({
          ...pattern,
          relevanceScore
        });
      }
    }

    // Sort by relevance score
    return relevantPatterns.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to analyze
   * @returns {Array<string>} - Keywords
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'want', 'need', 'use', 'implement', 'create']);

    return text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Generate implementation steps from patterns
   * @param {Array<Object>} patterns - Relevant patterns
   * @returns {Array<Object>} - Implementation steps
   */
  generateImplementationSteps(patterns) {
    const steps = [];

    // Step 1: Setup imports and dependencies
    const imports = this.collectRequiredImports(patterns);
    if (imports.length > 0) {
      steps.push({
        type: 'imports',
        description: 'Add required imports',
        code: imports.join('\n'),
        source: 'documentation_patterns'
      });
    }

    // Step 2: Implement functions/classes based on patterns
    patterns.forEach((pattern, index) => {
      steps.push({
        type: pattern.type,
        description: `Implement ${pattern.name || pattern.type} based on documentation example`,
        code: pattern.fullCode,
        source: 'documentation_example',
        relevance: pattern.relevanceScore
      });
    });

    // Step 3: Add documentation references
    steps.push({
      type: 'documentation',
      description: 'Add inline documentation references',
      code: this.generateDocumentationReferences(),
      source: 'documentation_context'
    });

    return steps;
  }

  /**
   * Collect required imports from patterns
   * @param {Array<Object>} patterns - Code patterns
   * @returns {Array<string>} - Required imports
   */
  collectRequiredImports(patterns) {
    const importSet = new Set();

    patterns.forEach(pattern => {
      if (pattern.imports) {
        pattern.imports.forEach(imp => importSet.add(imp));
      }
    });

    return Array.from(importSet);
  }

  /**
   * Collect required dependencies from patterns
   * @param {Array<Object>} patterns - Code patterns
   * @returns {Array<string>} - Required dependencies
   */
  collectRequiredDependencies(patterns) {
    const depSet = new Set();

    patterns.forEach(pattern => {
      if (pattern.dependencies) {
        pattern.dependencies.forEach(dep => depSet.add(dep));
      }
    });

    return Array.from(depSet);
  }

  /**
   * Generate documentation references for inline comments
   * @returns {string} - Documentation reference code
   */
  generateDocumentationReferences() {
    if (!this.documentationReference || !this.documentationReference.data) {
      return '// Implementation based on documentation references';
    }

    const refs = [];
    this.documentationReference.data.forEach((doc, index) => {
      refs.push(`// Source ${index + 1}: ${doc.title}`);
      if (doc.url) {
        refs.push(`// URL: ${doc.url}`);
      }
    });

    return refs.join('\n');
  }

  /**
   * Validate generated code against documentation
   * @param {string} generatedCode - Code to validate
   * @returns {Object} - Validation result
   */
  validateAgainstDocumentation(generatedCode) {
    const validation = {
      isValid: true,
      issues: [],
      suggestions: [],
      completenessScore: 0
    };

    if (!this.documentationReference) {
      validation.isValid = false;
      validation.issues.push('No documentation reference available for validation');
      return validation;
    }

    // Check for required patterns
    const missingPatterns = this.findMissingPatterns(generatedCode);
    if (missingPatterns.length > 0) {
      validation.suggestions.push(`Consider adding these documented patterns: ${missingPatterns.join(', ')}`);
    }

    // Check for required imports
    const requiredImports = this.collectRequiredImports(Array.from(this.codePatterns.values()));
    const usedImports = generatedCode.match(/(?:import|require)\s*\([^)]*\)|import\s+.*?from\s+['"][^'"]+['"]/g) || [];

    requiredImports.forEach(requiredImport => {
      const isImported = usedImports.some(used => used.includes(requiredImport));
      if (!isImported) {
        validation.issues.push(`Missing required import: ${requiredImport}`);
        validation.isValid = false;
      }
    });

    // Calculate completeness score
    const documentedPatterns = Array.from(this.codePatterns.values());
    const implementedPatterns = this.countImplementedPatterns(generatedCode, documentedPatterns);
    validation.completenessScore = documentedPatterns.length > 0
      ? implementedPatterns / documentedPatterns.length
      : 1;

    return validation;
  }

  /**
   * Find patterns missing from generated code
   * @param {string} code - Generated code
   * @returns {Array<string>} - Missing pattern signatures
   */
  findMissingPatterns(code) {
    const missing = [];

    for (const [signature, pattern] of this.codePatterns) {
      if (pattern.relevanceScore > 3 && !code.includes(pattern.name || signature)) {
        missing.push(pattern.name || signature);
      }
    }

    return missing;
  }

  /**
   * Count how many documented patterns are implemented in code
   * @param {string} code - Generated code
   * @param {Array<Object>} patterns - Documented patterns
   * @returns {number} - Count of implemented patterns
   */
  countImplementedPatterns(code, patterns) {
    let count = 0;

    patterns.forEach(pattern => {
      const name = pattern.name || this.extractFunctionName(pattern.fullCode);
      if (name && code.includes(name)) {
        count++;
      }
    });

    return count;
  }

  /**
   * Extract function name from code
   * @param {string} code - Code block
   * @returns {string|null} - Function name
   */
  extractFunctionName(code) {
    const match = code.match(/(?:function\s+(\w+)|(\w+)\s*[=:]\s*(?:function|\([^)]*\)\s*=>)|class\s+(\w+))/);
    return match ? (match[1] || match[2] || match[3]) : null;
  }

  /**
   * Get implementation report
   * @returns {Object} - Implementation report
   */
  getImplementationReport() {
    return {
      documentationSource: this.documentationReference ? {
        source: this.documentationReference.source || 'Unknown',
        documentCount: this.documentationReference.data ? this.documentationReference.data.length : 0,
        success: this.documentationReference.success
      } : null,
      extractedPatterns: this.codePatterns.size,
      implementationSteps: this.implementationSteps.length,
      patternTypes: this.getPatternTypeDistribution()
    };
  }

  /**
   * Get distribution of pattern types
   * @returns {Object} - Pattern type counts
   */
  getPatternTypeDistribution() {
    const distribution = {};

    for (const pattern of this.codePatterns.values()) {
      distribution[pattern.type] = (distribution[pattern.type] || 0) + 1;
    }

    return distribution;
  }
}

module.exports = DocumentationDrivenImplementer;