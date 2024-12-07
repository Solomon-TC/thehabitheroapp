import { supabase } from '../lib/supabase';
import { habitSchema, goalSchema } from './validation';
import { checkDataIntegrity } from './dataIntegrity';
import { monitor } from './monitoring';

interface TestResult {
  passed: boolean;
  description: string;
  error?: string;
}

interface TestSuite {
  name: string;
  results: TestResult[];
}

// Test data validation
async function testDataValidation(userId: string): Promise<TestSuite> {
  const results: TestResult[] = [];

  try {
    // Test habit validation
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    habits?.forEach(habit => {
      const validation = habitSchema.safeParse(habit);
      results.push({
        passed: validation.success,
        description: `Habit validation: ${habit.id}`,
        error: validation.success ? undefined : 'Invalid habit data'
      });
    });

    // Test goal validation
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    goals?.forEach(goal => {
      const validation = goalSchema.safeParse(goal);
      results.push({
        passed: validation.success,
        description: `Goal validation: ${goal.id}`,
        error: validation.success ? undefined : 'Invalid goal data'
      });
    });

  } catch (error) {
    results.push({
      passed: false,
      description: 'Data validation test suite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return {
    name: 'Data Validation Tests',
    results
  };
}

// Test data relationships
async function testDataRelationships(userId: string): Promise<TestSuite> {
  const results: TestResult[] = [];

  try {
    const integrityReport = await checkDataIntegrity(userId);

    results.push({
      passed: integrityReport.isValid,
      description: 'Data integrity check',
      error: integrityReport.isValid ? undefined : integrityReport.errors.join(', ')
    });

    if (integrityReport.warnings.length > 0) {
      results.push({
        passed: true,
        description: 'Data integrity warnings',
        error: `Warnings: ${integrityReport.warnings.join(', ')}`
      });
    }

  } catch (error) {
    results.push({
      passed: false,
      description: 'Data relationships test suite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return {
    name: 'Data Relationship Tests',
    results
  };
}

// Test performance metrics
async function testPerformance(): Promise<TestSuite> {
  const results: TestResult[] = [];
  const metrics = monitor.getMetrics();

  // Test API latency
  Object.entries(metrics.apiLatency).forEach(([endpoint, latency]) => {
    results.push({
      passed: latency < 1000, // 1 second threshold
      description: `API latency for ${endpoint}`,
      error: latency >= 1000 ? `High latency: ${latency}ms` : undefined
    });
  });

  // Test memory usage
  if (metrics.memoryUsage > 0) {
    results.push({
      passed: metrics.memoryUsage < 50 * 1024 * 1024, // 50MB threshold
      description: 'Memory usage',
      error: metrics.memoryUsage >= 50 * 1024 * 1024 ? 'High memory usage' : undefined
    });
  }

  // Test error rate
  results.push({
    passed: metrics.errorCount < 5,
    description: 'Error rate',
    error: metrics.errorCount >= 5 ? `High error count: ${metrics.errorCount}` : undefined
  });

  return {
    name: 'Performance Tests',
    results
  };
}

// Test state consistency
async function testStateConsistency(userId: string): Promise<TestSuite> {
  const results: TestResult[] = [];

  try {
    // Test character state
    const { data: character } = await supabase
      .from('characters')
      .select('level, experience')
      .eq('user_id', userId)
      .single();

    if (character) {
      const expectedLevel = Math.floor(Math.sqrt(character.experience / 100)) + 1;
      results.push({
        passed: character.level === expectedLevel,
        description: 'Character level consistency',
        error: character.level !== expectedLevel ? 
          `Level mismatch: ${character.level} vs expected ${expectedLevel}` : 
          undefined
      });
    }

    // Test habit streaks
    const { data: habits } = await supabase
      .from('habits')
      .select('id, current_streak, longest_streak')
      .eq('user_id', userId);

    habits?.forEach(habit => {
      results.push({
        passed: habit.current_streak <= habit.longest_streak,
        description: `Habit streak consistency: ${habit.id}`,
        error: habit.current_streak > habit.longest_streak ?
          'Current streak exceeds longest streak' :
          undefined
      });
    });

  } catch (error) {
    results.push({
      passed: false,
      description: 'State consistency test suite',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return {
    name: 'State Consistency Tests',
    results
  };
}

// Run all tests
export async function runDiagnostics(userId: string): Promise<TestSuite[]> {
  const suites: TestSuite[] = [];

  try {
    // Run all test suites
    suites.push(await testDataValidation(userId));
    suites.push(await testDataRelationships(userId));
    suites.push(await testPerformance());
    suites.push(await testStateConsistency(userId));

    // Log test results
    console.group('Diagnostic Results');
    suites.forEach(suite => {
      console.group(suite.name);
      suite.results.forEach(result => {
        if (result.passed) {
          console.log('✅', result.description);
        } else {
          console.error('❌', result.description, result.error);
        }
      });
      console.groupEnd();
    });
    console.groupEnd();

  } catch (error) {
    console.error('Failed to run diagnostics:', error);
  }

  return suites;
}

// Helper function to format test results
export function formatTestResults(suites: TestSuite[]): string {
  let report = '📊 Diagnostic Report\n\n';

  const totalTests = suites.reduce((sum, suite) => sum + suite.results.length, 0);
  const passedTests = suites.reduce((sum, suite) => 
    sum + suite.results.filter(r => r.passed).length, 0);

  report += `Overall: ${passedTests}/${totalTests} tests passed\n\n`;

  suites.forEach(suite => {
    const suitePass = suite.results.filter(r => r.passed).length;
    const suiteTotal = suite.results.length;
    report += `${suite.name}: ${suitePass}/${suiteTotal}\n`;
    
    suite.results.forEach(result => {
      const symbol = result.passed ? '✅' : '❌';
      report += `${symbol} ${result.description}\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
    });
    report += '\n';
  });

  return report;
}
