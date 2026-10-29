function formatStatus(status) {
  if (status === 'passed') return 'PASS';
  if (status === 'skipped') return 'SKIP';
  return 'FAIL';
}

function truncate(value, width) {
  return value.length > width ? value.slice(0, width - 3) + '...' : value;
}

function line(widths) {
  return '+' + widths.map((width) => '-'.repeat(width + 2)).join('+') + '+';
}

function row(values, widths) {
  return '| ' + values.map((value, index) => value.padEnd(widths[index])).join(' | ') + ' |';
}

class ConsoleTableReporter {
  constructor() {
    this.rows = new Map();
  }

  onTestEnd(test, result) {
    const parts = test.titlePath().slice(1).filter((part) => !part.endsWith('.feature.spec.js'));
    const title = parts.slice(-2).join(' > ');
    this.rows.set(test.id, {
      status: formatStatus(result.status),
      title: truncate(title, 88),
      duration: (result.duration / 1000).toFixed(1) + 's',
      rawStatus: result.status,
      error: result.error ? result.error.message.split(/\r?\n/)[0] : '',
    });
  }

  onEnd() {
    const rows = [...this.rows.values()];
    const widths = [6, 88, 8];
    const border = line(widths);

    console.log('\nPlaywright test results');
    console.log(border);
    console.log(row(['STATUS', 'TEST', 'TIME'], widths));
    console.log(border);

    for (const item of rows) {
      console.log(row([item.status, item.title, item.duration], widths));
    }

    console.log(border);
    const passed = rows.filter((item) => item.rawStatus === 'passed').length;
    const failed = rows.filter((item) => item.rawStatus !== 'passed' && item.rawStatus !== 'skipped').length;
    const skipped = rows.filter((item) => item.rawStatus === 'skipped').length;
    console.log('Total: ' + rows.length + ' | Passed: ' + passed + ' | Failed: ' + failed + ' | Skipped: ' + skipped);

    const failures = rows.filter((item) => item.rawStatus !== 'passed' && item.rawStatus !== 'skipped');
    if (failures.length) {
      console.log('\nFailure details:');
      for (const item of failures) {
        console.log('- ' + item.title + ': ' + item.error);
      }
    }
    console.log('');
  }
}

module.exports = ConsoleTableReporter;
