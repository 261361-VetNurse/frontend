import Container from './Container';

// Example 1: Normal page with default settings
export function NormalPageExample() {
  return (
    <Container>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Normal Page</h1>
        <p>This content uses default Container settings (max-width: 1280px, padding: 16px)</p>
      </div>
    </Container>
  );
}

// Example 2: Wide admin dashboard
export function AdminDashboardExample() {
  return (
    <Container maxWidth={1440} paddingX={24}>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>This content uses wider settings (max-width: 1440px, padding: 24px)</p>
      </div>
    </Container>
  );
}

// Example 3: Full-width fluid layout
export function FullWidthExample() {
  return (
    <Container fluid>
      <div className="bg-blue-500 text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Full Width Section</h1>
        <p>This content ignores maxWidth and uses full width with default padding</p>
      </div>
    </Container>
  );
}

// Example 4: Semantic HTML override
export function SemanticExample() {
  return (
    <Container as="section" maxWidth="800px" paddingX="32px">
      <article className="prose prose-lg max-w-none">
        <h2>Article Section</h2>
        <p>This Container renders as a semantic &lt;section&gt; element with custom dimensions.</p>
      </article>
    </Container>
  );
}

// Example 5: Responsive usage
export function ResponsiveExample() {
  return (
    <Container maxWidth="100%" paddingX="32px">
      <div className="bg-gray-100 rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Responsive Container</h1>
        <p>For responsive design, use CSS-in-JS responsive patterns or media queries in your styled-components setup</p>
      </div>
    </Container>
  );
}
