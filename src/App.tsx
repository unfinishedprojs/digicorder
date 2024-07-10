import { createTheme, ThemeProvider } from "@suid/material";
import { Route, Router } from "@solidjs/router";
import MainPage from "./pages/Main";

export default function App() {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <Route path='/' component={MainPage}/>
      </Router>
    </ThemeProvider>
  );
}
