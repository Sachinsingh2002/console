import { Outlet } from "react-router-dom";
// material
import { styled } from "@mui/material/styles";
//
import Navbar from "./Navbar";
import { Box, Container, Stack } from "@mui/material";

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled("div")({
  display: "flex",
  minHeight: "100%",
  overflow: "hidden",
});

const MainStyle = styled("div")(({ theme }) => ({
  flexGrow: 1,
  overflow: "auto",
  minHeight: "100%",
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up("lg")]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// ----------------------------------------------------------------------
const releaseBranch = process.env.REACT_APP_RELEASE_BRANCH || "dev";
const releaseDate = process.env.REACT_APP_RELEASE_DATE || "1970-01-01_00:00";
const releaseCommit =
  process.env.REACT_APP_RELEASE_COMMIT ||
  "0000000000000000000000000000000000000000";
const name =
  releaseBranch + "-" + releaseDate + "-" + releaseCommit.slice(0, 7);

export default function DashboardLayout() {
  return (
    <RootStyle>
      <Navbar />
      <MainStyle>
        <Outlet />
        {!window.location.pathname.startsWith("/onboarding") &&
          window.location.pathname !== "/" && (
            <Container
              sx={{ opacity: 0.4, textAlign: "center", padding: "2rem" }}
            >
              <Stack
                direction="row"
                spacing={3}
                alignItems="flex-start"
                flexWrap="wrap"
                useFlexGap
              >
                <Stack spacing={1} alignItems={"flex-start"}>
                  <p>Project</p>
                  <p>
                    <a
                      style={{
                        color: "inherit",
                        whiteSpace: "nowrap",
                        marginBottom: "1rem",
                      }}
                      href="https://github.com/kthcloud/landing-frontend/issues/new/choose"
                    >
                      Report a bug
                    </a>
                  </p>
                  <p>
                    <a
                      style={{
                        color: "inherit",
                        whiteSpace: "nowrap",
                      }}
                      href="https://github.com/kthcloud/landing-frontend"
                    >
                      kthcloud/landing-frontend
                    </a>
                  </p>
                  <p>
                    <span style={{ whiteSpace: "nowrap" }}>{name}</span>
                  </p>
                </Stack>
                <Box sx={{ flexGrow: 1 }} />
                <Stack spacing={1} alignItems={"flex-start"}>
                  <p>Help</p>
                  <p>
                    <a
                      style={{
                        color: "inherit",
                        whiteSpace: "nowrap",
                      }}
                      href="https://discord.gg/MuHQd6QEtM"
                    >
                      Discord
                    </a>
                  </p>
                  <p>
                    <a
                      style={{
                        color: "inherit",
                        whiteSpace: "nowrap",
                      }}
                      href="https://wiki.cloud.cbh.kth.se"
                    >
                      Wiki
                    </a>
                  </p>
                </Stack>
                <Stack spacing={1} alignItems={"flex-start"}>
                  <p>Follow kthcloud</p>
                  <p>
                    <a
                      style={{
                        color: "inherit",
                        whiteSpace: "nowrap",
                      }}
                      href="https://mastodon.social/@kthcloud"
                    >
                      Mastodon
                    </a>
                  </p>
                  <p>
                    <a
                      style={{
                        color: "inherit",
                        whiteSpace: "nowrap",
                      }}
                      href="https://mastodon.social/@kthcloud"
                    >
                      Bluesky
                    </a>
                  </p>
                </Stack>
              </Stack>
            </Container>
          )}
      </MainStyle>
    </RootStyle>
  );
}
