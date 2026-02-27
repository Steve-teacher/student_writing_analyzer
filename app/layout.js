export const metadata = {
  title: "Student Writing Analyser",
  description: "Analyse student writing samples against CCSS ELA Grades 6–8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>{children}</body>
    </html>
  );
}
