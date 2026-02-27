import "./globals.css";

export const metadata = {
  title: "Student Writing Analyser",
  description: "Analyse student writing samples against CCSS ELA Grades 6–8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
