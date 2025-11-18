/**
 * Documentation Validator for Generated Code
 *
 * This validator ensures that generated code strictly adheres to the provided
 * documentation and doesn't introduce knowledge beyond the documentation scope.
 */

class DocumentationValidator {
  constructor() {
    this.validationRules = new Map();
    this.documentationConstraints = new Map();
    this.setupDefaultRules();
  }

  /**
   * Setup default validation rules
   */
  setupDefaultRules() {
    // Rule: No external knowledge beyond documentation
    this.validationRules.set('external_knowledge_check', {
      description: 'Ensure code only uses concepts from documentation',
      validate: this.validateExternalKnowledge.bind(this),
      severity: 'high'
    });

    // Rule: Import validation
    this.validationRules.set('import_validation', {
      description: 'Validate all imports are documented',
      validate: this.validateImports.bind(this),
      severity: 'high'
    });

    // Rule: Function signature validation
    this.validationRules.set('function_signature_validation', {
      description: 'Ensure function signatures match documentation examples',
      validate: this.validateFunctionSignatures.bind(this),
      severity: 'medium'
    });

    // Rule: Pattern adherence
    this.validationRules.set('pattern_adherence', {
      description: 'Validate code follows documented patterns',
      validate: this.validatePatterns.bind(this),
      severity: 'high'
    });

    // Rule: Dependency validation
    this.validationRules.set('dependency_validation', {
      description: 'Validate dependencies are documented',
      validate: this.validateDependencies.bind(this),
      severity: 'medium'
    });
  }

  /**
   * Validate generated code against documentation
   * @param {string} generatedCode - Code to validate
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Comprehensive validation result
   */
  validateCode(generatedCode, documentation) {
    const validationResult = {
      isValid: true,
      score: 0,
      violations: [],
      warnings: [],
      suggestions: [],
      compliance: {
        documentation: 0,
        patterns: 0,
        imports: 0,
        overall: 0
      },
      metadata: {
        codeLines: generatedCode.split('\n').length,
        validationTime: new Date().toISOString(),
        documentationSource: this.extractDocSource(documentation)
      }
    };

    // Set documentation constraints
    this.setDocumentationConstraints(documentation);

    // Run all validation rules
    for (const [ruleName, rule] of this.validationRules) {
      try {
        const ruleResult = rule.validate(generatedCode, documentation);

        if (ruleResult.violations) {
          validationResult.violations.push(...ruleResult.violations.map(v => ({
            ...v,
            rule: ruleName,
            severity: rule.severity
          })));
        }

        if (ruleResult.warnings) {
          validationResult.warnings.push(...ruleResult.warnings.map(w => ({
            ...w,
            rule: ruleName
          })));
        }

        if (ruleResult.suggestions) {
          validationResult.suggestions.push(...ruleResult.suggestions.map(s => ({
            ...s,
            rule: ruleName
          })));
        }

        if (ruleResult.score !== undefined) {
          validationResult.score += ruleResult.score;
        }

      } catch (error) {
        validationResult.violations.push({
          rule: ruleName,
          severity: 'high',
          message: `Validation rule failed: ${error.message}`,
          line: null
        });
      }
    }

    // Calculate compliance scores
    validationResult.compliance = this.calculateCompliance(validationResult, documentation);

    // Determine overall validity
    validationResult.isValid = validationResult.violations.length === 0 &&
                             validationResult.compliance.overall >= 0.8;

    // Normalize score (0-100)
    validationResult.score = Math.min(Math.max(validationResult.score, 0), 100);

    return validationResult;
  }

  /**
   * Set documentation constraints
   * @param {Object} documentation - Documentation reference
   */
  setDocumentationConstraints(documentation) {
    this.documentationConstraints.clear();

    if (!documentation || !documentation.data) {
      return;
    }

    const constraints = {
      allowedImports: new Set(),
      allowedFunctions: new Set(),
      allowedPatterns: [],
      allowedDependencies: new Set(),
      documentedConcepts: new Set()
    };

    documentation.data.forEach(doc => {
      // Extract allowed imports
      const imports = this.extractImportsFromContent(doc.content);
      imports.forEach(imp => constraints.allowedImports.add(imp));

      // Extract allowed functions
      const functions = this.extractFunctionsFromContent(doc.content);
      functions.forEach(func => constraints.allowedFunctions.add(func));

      // Extract patterns
      const patterns = this.extractPatternsFromContent(doc.content);
      constraints.allowedPatterns.push(...patterns);

      // Extract dependencies
      const dependencies = this.extractDependenciesFromContent(doc.content);
      dependencies.forEach(dep => constraints.allowedDependencies.add(dep));

      // Extract concepts
      const concepts = this.extractConceptsFromContent(doc.content);
      concepts.forEach(concept => constraints.documentedConcepts.add(concept));
    });

    this.documentationConstraints.set('constraints', constraints);
  }

  /**
   * Validate against external knowledge usage
   * @param {string} code - Code to validate
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Validation result
   */
  validateExternalKnowledge(code, documentation) {
    const result = {
      violations: [],
      warnings: [],
      suggestions: [],
      score: 20
    };

    const constraints = this.documentationConstraints.get('constraints');
    if (!constraints) {
      result.warnings.push({
        message: 'No documentation constraints available for validation',
        line: null
      });
      return result;
    }

    // Check for undocumented imports
    const codeImports = this.extractImportsFromCode(code);
    codeImports.forEach(imp => {
      if (!this.isAllowedImport(imp, constraints.allowedImports)) {
        result.violations.push({
          message: `Using undocumented import: ${imp}`,
          line: this.findImportLine(code, imp),
          suggestion: `Remove import or find documentation reference for: ${imp}`
        });
        result.score -= 5;
      }
    });

    // Check for undocumented functions/variables
    const codeFunctions = this.extractFunctionsFromCode(code);
    codeFunctions.forEach(func => {
      if (!this.isDocumentedFunction(func, constraints.allowedFunctions)) {
        result.warnings.push({
          message: `Using potentially undocumented function: ${func}`,
          line: this.findFunctionLine(code, func)
        });
      }
    });

    return result;
  }

  /**
   * Validate imports against documentation
   * @param {string} code - Code to validate
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Validation result
   */
  validateImports(code, documentation) {
    const result = {
      violations: [],
      warnings: [],
      suggestions: [],
      score: 25
    };

    const constraints = this.documentationConstraints.get('constraints');
    if (!constraints) {
      return result;
    }

    const requiredImports = this.extractRequiredImports(documentation);
    const codeImports = this.extractImportsFromCode(code);

    // Check for missing required imports
    requiredImports.forEach(required => {
      const isImported = codeImports.some(codeImp =>
        codeImp.includes(required) || required.includes(codeImp)
      );

      if (!isImported) {
        result.violations.push({
          message: `Missing required import from documentation: ${required}`,
          line: 1,
          suggestion: `Add import: ${required}`
        });
        result.score -= 5;
      }
    });

    // Check for extra undocumented imports
    codeImports.forEach(codeImp => {
      if (!this.isDocumentedImport(codeImp, constraints.allowedImports)) {
        result.warnings.push({
          message: `Import not found in documentation: ${codeImp}`,
          line: this.findImportLine(code, codeImp),
          suggestion: `Verify this import is needed and documented`
        });
      }
    });

    return result;
  }

  /**
   * Validate function signatures
   * @param {string} code - Code to validate
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Validation result
   */
  validateFunctionSignatures(code, documentation) {
    const result = {
      violations: [],
      warnings: [],
      suggestions: [],
      score: 20
    };

    const documentedFunctions = this.extractDocumentedFunctionSignatures(documentation);
    const codeFunctions = this.extractFunctionSignaturesFromCode(code);

    codeFunctions.forEach(codeFunc => {
      const documentedMatch = documentedFunctions.find(docFunc =>
        this.functionSignaturesMatch(codeFunc, docFunc)
      );

      if (!documentedMatch) {
        result.warnings.push({
          message: `Function signature may not match documentation examples: ${codeFunc.name}`,
          line: codeFunc.line,
          suggestion: `Compare with documented function signatures`
        });
      }
    });

    return result;
  }

  /**
   * Validate code patterns adherence
   * @param {string} code - Code to validate
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Validation result
   */
  validatePatterns(code, documentation) {
    const result = {
      violations: [],
      warnings: [],
      suggestions: [],
      score: 25
    };

    const documentedPatterns = this.extractDocumentedPatterns(documentation);
    const codePatterns = this.extractCodePatterns(code);

    // Check if code follows documented patterns
    let patternMatchCount = 0;
    documentedPatterns.forEach(docPattern => {
      const hasMatch = codePatterns.some(codePattern =>
        this.patternsMatch(codePattern, docPattern)
      );

      if (hasMatch) {
        patternMatchCount++;
      } else {
        result.suggestions.push({
          message: `Consider implementing pattern from documentation: ${docPattern.description}`,
          line: null,
          suggestion: `Follow documented pattern: ${docPattern.example}`
        });
      }
    });

    // Score based on pattern adherence
    const patternCompliance = documentedPatterns.length > 0
      ? patternMatchCount / documentedPatterns.length
      : 1;
    result.score = result.score * patternCompliance;

    return result;
  }

  /**
   * Validate dependencies
   * @param {string} code - Code to validate
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Validation result
   */
  validateDependencies(code, documentation) {
    const result = {
      violations: [],
      warnings: [],
      suggestions: [],
      score: 10
    };

    const constraints = this.documentationConstraints.get('constraints');
    if (!constraints) {
      return result;
    }

    const codeDependencies = this.extractCodeDependencies(code);

    codeDependencies.forEach(dep => {
      if (!constraints.allowedDependencies.has(dep)) {
        result.warnings.push({
          message: `Using dependency not found in documentation: ${dep}`,
          line: this.findDependencyLine(code, dep),
          suggestion: `Verify this dependency is documented`
        });
      }
    });

    return result;
  }

  /**
   * Calculate compliance scores
   * @param {Object} validationResult - Current validation result
   * @param {Object} documentation - Documentation reference
   * @returns {Object} - Compliance scores
   */
  calculateCompliance(validationResult, documentation) {
    const constraints = this.documentationConstraints.get('constraints');

    if (!constraints) {
      return {
        documentation: 0,
        patterns: 0,
        imports: 0,
        overall: 0
      };
    }

    // Documentation compliance (based on violations)
    const documentationScore = Math.max(0, 1 - (validationResult.violations.length / 10));

    // Pattern compliance (based on pattern matching)
    const patternScore = this.calculatePatternCompliance(validationResult);

    // Import compliance (based on import validation)
    const importScore = this.calculateImportCompliance(validationResult);

    // Overall compliance
    const overallScore = (documentationScore + patternScore + importScore) / 3;

    return {
      documentation: Math.round(documentationScore * 100),
      patterns: Math.round(patternScore * 100),
      imports: Math.round(importScore * 100),
      overall: Math.round(overallScore * 100)
    };
  }

  /**
   * Calculate pattern compliance score
   * @param {Object} validationResult - Validation result
   * @returns {number} - Pattern compliance score
   */
  calculatePatternCompliance(validationResult) {
    const patternViolations = validationResult.violations.filter(v =>
      v.rule === 'pattern_adherence'
    ).length;

    const patternSuggestions = validationResult.suggestions.filter(s =>
      s.rule === 'pattern_adherence'
    ).length;

    const totalPatternIssues = patternViolations + patternSuggestions;
    return Math.max(0, 1 - (totalPatternIssues / 5));
  }

  /**
   * Calculate import compliance score
   * @param {Object} validationResult - Validation result
   * @returns {number} - Import compliance score
   */
  calculateImportCompliance(validationResult) {
    const importViolations = validationResult.violations.filter(v =>
      v.rule === 'import_validation'
    ).length;

    const importWarnings = validationResult.warnings.filter(w =>
      w.rule === 'import_validation'
    ).length;

    const totalImportIssues = importViolations + (importWarnings * 0.5);
    return Math.max(0, 1 - (totalImportIssues / 5));
  }

  // Helper methods for extraction and matching

  extractImportsFromContent(content) {
    const imports = [];
    const importRegex = /(?:import|require)\s*\([^)]*\)|import\s+.*?from\s+['"][^'"]+['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[0]);
    }

    return imports;
  }

  extractImportsFromCode(code) {
    return this.extractImportsFromContent(code);
  }

  extractFunctionsFromContent(content) {
    const functions = [];
    const functionRegex = /(?:function\s+(\w+)|(\w+)\s*[=:]\s*(?:function|\([^)]*\)\s*=>)|class\s+(\w+))/g;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3];
      if (name) {
        functions.push(name);
      }
    }

    return functions;
  }

  extractFunctionsFromCode(code) {
    return this.extractFunctionsFromContent(code);
  }

  extractPatternsFromContent(content) {
    const patterns = [];

    // Extract common patterns
    const patternIndicators = [
      { pattern: 'useState', description: 'React state hook' },
      { pattern: 'useEffect', description: 'React effect hook' },
      { pattern: 'async/await', description: 'Async programming pattern' },
      { pattern: 'Promise', description: 'Promise pattern' },
      { pattern: 'try/catch', description: 'Error handling pattern' }
    ];

    patternIndicators.forEach(indicator => {
      if (content.includes(indicator.pattern)) {
        patterns.push(indicator);
      }
    });

    return patterns;
  }

  extractDependenciesFromContent(content) {
    const dependencies = new Set();
    const dependencyRegex = /(\w+)\./g;
    let match;

    while ((match = dependencyRegex.exec(content)) !== null) {
      const dep = match[1];
      if (!['console', 'window', 'document', 'global'].includes(dep)) {
        dependencies.add(dep);
      }
    }

    return Array.from(dependencies);
  }

  extractConceptsFromContent(content) {
    const concepts = new Set();

    // Extract technical concepts
    const conceptPatterns = [
      /component/i,
      /hook/i,
      /state/i,
      /props/i,
      /event/i,
      /handler/i,
      /callback/i,
      /method/i,
      /class/i,
      /function/i,
      /variable/i,
      /constant/i,
      /module/i,
      /export/i,
      /import/i
    ];

    conceptPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => concepts.add(match.toLowerCase()));
      }
    });

    return Array.from(concepts);
  }

  isAllowedImport(importStr, allowedImports) {
    return Array.from(allowedImports).some(allowed =>
      importStr.includes(allowed) || allowed.includes(importStr)
    );
  }

  isDocumentedImport(importStr, documentedImports) {
    return this.isAllowedImport(importStr, documentedImports);
  }

  isDocumentedFunction(funcName, documentedFunctions) {
    return documentedFunctions.has(funcName);
  }

  findImportLine(code, importStr) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(importStr)) {
        return i + 1;
      }
    }
    return null;
  }

  findFunctionLine(code, funcName) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(funcName) && (lines[i].includes('function') || lines[i].includes('=') || lines[i].includes('=>'))) {
        return i + 1;
      }
    }
    return null;
  }

  findDependencyLine(code, dep) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`${dep}.`)) {
        return i + 1;
      }
    }
    return null;
  }

  extractDocSource(documentation) {
    if (!documentation) return 'Unknown';
    return documentation.source || 'Context7/Web Search';
  }

  extractRequiredImports(documentation) {
    const imports = [];
    if (documentation && documentation.data) {
      documentation.data.forEach(doc => {
        const docImports = this.extractImportsFromContent(doc.content);
        imports.push(...docImports);
      });
    }
    return [...new Set(imports)];
  }

  extractDocumentedFunctionSignatures(documentation) {
    const signatures = [];
    if (documentation && documentation.data) {
      documentation.data.forEach(doc => {
        const codeBlocks = this.extractCodeBlocks(doc.content);
        codeBlocks.forEach(block => {
          const signature = this.extractFunctionSignature(block);
          if (signature) {
            signatures.push(signature);
          }
        });
      });
    }
    return signatures;
  }

  extractCodeBlocks(content) {
    const codeBlocks = [];
    const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push(match[1].trim());
    }

    return codeBlocks;
  }

  extractFunctionSignature(codeBlock) {
    const lines = codeBlock.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes('function') || trimmed.includes('=') || trimmed.includes('=>')) {
        return {
          name: this.extractFunctionName(line),
          signature: trimmed,
          parameters: this.extractParameters(line),
          line: 1 // Relative to code block
        };
      }
    }
    return null;
  }

  extractFunctionName(line) {
    const match = line.match(/(?:function\s+(\w+)|(\w+)\s*[=:])/);
    return match ? (match[1] || match[2]) : null;
  }

  extractParameters(line) {
    const paramMatch = line.match(/\(([^)]*)\)/);
    return paramMatch ? paramMatch[1].split(',').map(p => p.trim()) : [];
  }

  extractFunctionSignaturesFromCode(code) {
    const signatures = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.includes('function') || trimmed.includes('=') || trimmed.includes('=>')) {
        const name = this.extractFunctionName(trimmed);
        if (name) {
          signatures.push({
            name: name,
            signature: trimmed,
            parameters: this.extractParameters(trimmed),
            line: index + 1
          });
        }
      }
    });

    return signatures;
  }

  functionSignaturesMatch(codeFunc, docFunc) {
    return codeFunc.name === docFunc.name &&
           codeFunc.parameters.length === docFunc.parameters.length;
  }

  extractDocumentedPatterns(documentation) {
    const patterns = [];
    if (documentation && documentation.data) {
      documentation.data.forEach(doc => {
        const docPatterns = this.extractPatternsFromContent(doc.content);
        docPatterns.forEach(pattern => {
          patterns.push({
            ...pattern,
            source: doc.title,
            example: this.extractExampleForPattern(doc.content, pattern.pattern)
          });
        });
      });
    }
    return patterns;
  }

  extractExampleForPattern(content, patternName) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(patternName)) {
        // Return a few lines around the pattern as example
        const start = Math.max(0, i - 1);
        const end = Math.min(lines.length, i + 3);
        return lines.slice(start, end).join('\n').trim();
      }
    }
    return null;
  }

  extractCodePatterns(code) {
    return this.extractPatternsFromContent(code);
  }

  patternsMatch(codePattern, docPattern) {
    return codePattern.pattern === docPattern.pattern ||
           codePattern.description === docPattern.description;
  }

  extractCodeDependencies(code) {
    return this.extractDependenciesFromContent(code);
  }

  /**
   * Generate validation report
   * @returns {Object} - Validation system report
   */
  getValidationReport() {
    return {
      rulesCount: this.validationRules.size,
      constraintsSet: this.documentationConstraints.size > 0,
      supportedValidations: Array.from(this.validationRules.keys()),
      lastValidation: new Date().toISOString()
    };
  }
}

module.exports = DocumentationValidator;