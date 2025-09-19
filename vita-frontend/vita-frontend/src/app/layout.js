import { AuthProvider } from "../../context/AuthContext";
import { TasksProvider } from "../../context/TasksContext/TasksContext";
import { TimerProvider } from "../../context/TimerContext";
import "./globals.css";

export const metadata = {
  title: "Vita | Dijital Ajanda",
  description: "Vita Dijital Ajanda",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased`}>
        <AuthProvider>
          <TasksProvider>
            <TimerProvider>{children}</TimerProvider>
          </TasksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
