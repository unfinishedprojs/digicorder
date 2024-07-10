import { Videocam } from "@suid/icons-material";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
} from "@suid/material";

export default function AppBarPer() {
  return (
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <Videocam />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Digicam
          </Typography>
        </Toolbar>
      </AppBar>
  );
}
