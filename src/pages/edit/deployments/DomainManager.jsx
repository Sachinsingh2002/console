import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useKeycloak } from "@react-keycloak/web";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { updateDeployment } from "src/api/deploy/deployments";
import Iconify from "src/components/Iconify";
import useResource from "src/hooks/useResource";
import { errorHandler } from "src/utils/errorHandler";
import { toUnicode } from "punycode";
import { useTranslation } from "react-i18next";
import { sentenceCase } from "change-case";

export const DomainManager = ({ deployment }) => {
  const { t } = useTranslation();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const { keycloak } = useKeycloak();
  const { queueJob } = useResource();
  const [initialDomain, setInitialDomain] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const steps = t("setup-custom-domain-steps").split("|");

  useEffect(() => {
    if (!deployment.customDomainUrl) return;

    const cleaned = toUnicode(
      deployment.customDomainUrl.replace("https://", "").trim()
    );
    setDomain(cleaned);
    setInitialDomain(cleaned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (d) => {
    const newDomain = d.trim();

    setLoading(true);
    let success = true;
    try {
      const res = await updateDeployment(
        deployment.id,
        { customDomain: newDomain },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-domain-update"), {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-update-domain") + e, {
          variant: "error",
        })
      );
      success = false;
    } finally {
      setLoading(false);
      return success;
    }
  };

  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await updateDeployment(
        deployment.id,
        { customDomain: null },
        keycloak.token
      );
      queueJob(res);
      enqueueSnackbar(t("saving-domain-update"), {
        variant: "info",
      });
    } catch (error) {
      errorHandler(error).forEach((e) =>
        enqueueSnackbar(t("could-not-update-domain") + e, {
          variant: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!(await handleSave(domain))) return;
    }
    if (activeStep === steps.length - 1) {
      setCreateDialogOpen(false);
      return;
    }
    setActiveStep((step) => step + 1);
  };

  return (
    <>
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>{t("setup-custom-domain")}</DialogTitle>
        <DialogContent>
          <Stack
            direction="column"
            alignItems={"flex-start"}
            useFlexGap
            spacing={5}
          >
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {activeStep === 0 && (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-0")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-0-warning")}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("type")}</TableCell>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNAME</TableCell>
                        <TableCell>
                          <TextField
                            label={t("create-deployment-domain")}
                            variant="outlined"
                            placeholder={initialDomain}
                            value={domain}
                            onChange={(e) => {
                              setDomain(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSave(e.target.value);
                              }
                            }}
                            fullWidth
                            sx={{ maxWidth: "sm" }}
                            disabled={loading}
                          />{" "}
                        </TableCell>
                        <TableCell>app.cloud.cbh.kth.se</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {activeStep === 1 && (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-1")}
                </Typography>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-1-table")}
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("type")}</TableCell>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNAME</TableCell>
                        <TableCell>
                          {deployment.customDomainUrl ? (
                            deployment.customDomainUrl.split("//")[1]
                          ) : (
                            <Skeleton />
                          )}
                        </TableCell>
                        <TableCell>app.cloud.cbh.kth.se</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TXT</TableCell>
                        <TableCell>
                          {deployment.customDomainUrl ? (
                            "_kthcloud." +
                            deployment.customDomainUrl.split("//")[1]
                          ) : (
                            <Skeleton />
                          )}
                        </TableCell>
                        <TableCell>{deployment.customDomainSecret}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {activeStep === 2 && (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-2")}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-2-warning")}
                </Typography>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setCreateDialogOpen(false)}>
            {t("button-close")}
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          {activeStep > 0 && (
            <Button
              variant="outlined"
              onClick={() => setActiveStep(activeStep - 1)}
            >
              {t("previous")}
            </Button>
          )}

          <LoadingButton
            variant="contained"
            onClick={handleNext}
            loading={loading}
          >
            {t("next")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Card sx={{ boxShadow: 20 }}>
        <CardHeader
          title={t("create-deployment-domain")}
          subheader={t("setup-custom-domain-subheader")}
        />
        <CardContent>
          <Stack direction="column" spacing={3}>
            <Stack direction="row" spacing={3} alignItems="center" useFlexGap>
              {deployment.customDomainStatus && (
                <Chip
                  label={
                    t("admin-status") +
                    ": " +
                    sentenceCase(deployment.customDomainStatus)
                  }
                />
              )}
              {deployment.customDomainUrl && (
                <Chip
                  label={deployment.customDomainUrl}
                  icon={<Iconify icon="mdi:globe" />}
                  component={Link}
                  href={deployment.customDomainUrl}
                  target="_blank"
                  rel="noreferrer"
                  underline="none"
                />
              )}
              <Button
                variant="contained"
                onClick={() => setCreateDialogOpen(true)}
                startIcon={
                  <Iconify
                    icon={
                      !deployment.customDomainUrl ? "mdi:plus" : "mdi:pencil"
                    }
                  />
                }
              >
                {!deployment.customDomainUrl
                  ? t("setup-domain")
                  : t("edit-domain")}
              </Button>
              {deployment.customDomainUrl && (
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  color="error"
                  startIcon={<Iconify icon="mdi:trash" />}
                >
                  {t("clear-domain")}
                </Button>
              )}
            </Stack>
            {!deployment.customDomainUrl ? (
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {t("no-custom-domain")}
              </Typography>
            ) : (
              <>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {t("setup-custom-domain-1-table")}
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("type")}</TableCell>
                        <TableCell>{t("admin-name")}</TableCell>
                        <TableCell>{t("content")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>CNAME</TableCell>
                        <TableCell>
                          {deployment.customDomainUrl.split("//")[1]}
                        </TableCell>
                        <TableCell>app.cloud.cbh.kth.se</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TXT</TableCell>
                        <TableCell>
                          _kthcloud.{deployment.customDomainUrl.split("//")[1]}
                        </TableCell>
                        <TableCell>{deployment.customDomainSecret}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};
