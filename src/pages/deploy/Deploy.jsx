// mui
import {
  Card,
  Table,
  Stack,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  Alert,
  Link,
  Button,
  Tooltip,
} from "@mui/material";

// hooks
import useAlert from "src/hooks/useAlert";
import useResource from "src/hooks/useResource";
import useInterval from "../../hooks/useInterval";
import { useState, useEffect, useContext } from "react";
import { useKeycloak } from "@react-keycloak/web";

// utils
import { filter } from "lodash";
import { sentenceCase } from "change-case";

// components
import Page from "../../components/Page";
import Label from "../../components/Label";
import Scrollbar from "../../components/Scrollbar";
import ListHead from "./ListHead";
import ListToolbar from "./ListToolbar";
import SearchNotFound from "./SearchNotFound";
import JobList from "../../components/JobList";
import { Link as RouterLink } from "react-router-dom";
import LoadingPage from "../../components/LoadingPage";
import Iconify from "../../components/Iconify";
import { LinkOffTwoTone } from "@mui/icons-material";
import { deleteDeployment } from "src/api/deploy/deployments";
import { deleteVM } from "src/api/deploy/vms";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "name", label: "Name", alignRight: false },
  { id: "type", label: "Instance type", alignRight: false },
  { id: "status", label: "Status", alignRight: false },
  { id: "" },
];

// ----------------------------------------------------------------------

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const applySortFilter = (array, comparator, query) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
};

export function Deploy() {
  const [order, setOrder] = useState("asc");

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState("name");

  const [filterName, setFilterName] = useState("");

  const { rows, setRows, initialLoad, queueJob } = useResource();

  const [loading, setLoading] = useState(false);

  const { keycloak, initialized } = useKeycloak();

  const { setAlert } = useAlert();

  const bulkDelete = async () => {
    if (!initialized) return;
    setLoading(true);

    const promises = selected.map(async (id) => {
      if (rows.find((row) => row.id === id).type === "vm") {
        console.log("deleting vm");
        const res = await deleteVM(id, keycloak.token);
        queueJob(res);
        return;
      }
      if (rows.find((row) => row.id === id).type === "deployment") {
        console.log("deleting k8s");
        const res = await deleteDeployment(id, keycloak.token);
        queueJob(res);
        return;
      }
    });

    await Promise.all(promises);

    setSelected([]);
    setAlert("Successfully deleted resources", "success");
    setLoading(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const noResultsFound = rows.length === 0;

  const renderResourceButtons = (resource) => {
    if (
      resource.type === "deployment" &&
      resource.url !== "https://notset" &&
      resource.private === false
    ) {
      return (
        <>
          <Link
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            underline="none"
            mr={2}
          >
            <Iconify icon="mdi:external-link" width={24} height={24} />
          </Link>
          <Link
            component={RouterLink}
            to={`/edit/${resource.type}/${resource.id}`}
          >
            <Iconify icon="mdi:pencil" width={24} height={24} />
          </Link>
        </>
      );
    } else {
      return (
        <Link
          component={RouterLink}
          to={`/edit/${resource.type}/${resource.id}`}
        >
          <Iconify icon="mdi:pencil" width={24} height={24} />
        </Link>
      );
    }
  };

  const renderResourceType = (resource) => {
    if (resource.type === "vm" && resource.gpu) {
      const tooltip = "NVIDIA " + resource.gpu.name;

      return (
        <Typography
          variant="body2"
          color="text.primary"
          display="flex"
          alignItems="center"
        >
          {resource.type}
          <Tooltip title={tooltip}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <Iconify icon="bi:gpu-card" width={20} height={20} ml={1} />
            </span>
          </Tooltip>
        </Typography>
      );
    } else if (resource.type === "deployment" && resource.private === true) {
      const tooltip =
        "This deployment is private. It is not visible on the Internet.";

      return (
        <Typography
          variant="body2"
          color="text.primary"
          display="flex"
          alignItems="center"
        >
          {resource.type}
          <Tooltip title={tooltip}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <Iconify icon="mdi:eye-off" width={20} height={20} ml={1} />
            </span>
          </Tooltip>
        </Typography>
      );
    } else {
      return resource.type;
    }
  };

  return (
    <>
      {!initialLoad ? (
        <LoadingPage />
      ) : (
        <Page title="Deploy">
          <Container>
            <Stack
              sx={{
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-begin", sm: "center" },
              }}
              alignItems="center"
              justifyContent="space-between"
              mb={2}
              direction="row"
            >
              <Typography variant="h4" gutterBottom>
                Deploy
              </Typography>

              <Button
                variant="contained"
                component={RouterLink}
                to="/create"
                startIcon={<Iconify icon={"mdi:plus"} />}
              >
                Create
              </Button>
            </Stack>

            <JobList />

            <Card sx={{ boxShadow: 20 }}>
              <ListToolbar
                numSelected={selected.length}
                filterName={filterName}
                onFilterName={handleFilterByName}
                loading={loading}
                selected={selected}
                onDelete={bulkDelete}
              />

              <Scrollbar>
                <TableContainer sx={{ minWidth: 600 }}>
                  <Table>
                    <ListHead
                      order={order}
                      orderBy={orderBy}
                      headLabel={TABLE_HEAD}
                      rowCount={rows.length}
                      numSelected={selected.length}
                      onRequestSort={handleRequestSort}
                      onSelectAllClick={handleSelectAllClick}
                    />
                    <TableBody>
                      {applySortFilter(
                        rows,
                        getComparator(order, orderBy),
                        filterName
                      ).map((row) => {
                        const isItemSelected = selected.indexOf(row.id) !== -1;

                        return (
                          <TableRow
                            hover
                            key={row.id}
                            tabIndex={-1}
                            role="checkbox"
                            selected={isItemSelected}
                            aria-checked={isItemSelected}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isItemSelected}
                                onChange={(event) => handleClick(event, row.id)}
                              />
                            </TableCell>
                            <TableCell align="left">
                              <Link
                                component={RouterLink}
                                to={`/edit/${row.type}/${row.id}`}
                                sx={{ textDecoration: "none" }}
                              >
                                {row.name}
                              </Link>
                            </TableCell>
                            <TableCell align="left">
                              {renderResourceType(row)}
                            </TableCell>
                            <TableCell align="left">
                              <Label
                                variant="ghost"
                                color={
                                  (row.status === "resourceError" && "error") ||
                                  (row.status === "resourceUnknown" &&
                                    "error") ||
                                  (row.status === "resourceStopped" &&
                                    "warning") ||
                                  (row.status === "resourceBeingCreated" &&
                                    "info") ||
                                  (row.status === "resourceBeingDeleted" &&
                                    "info") ||
                                  (row.status === "resourceBeingDeleted" &&
                                    "info") ||
                                  (row.status === "resourceStarting" &&
                                    "info") ||
                                  (row.status === "resourceStopping" &&
                                    "info") ||
                                  (row.status === "resourceRunning" &&
                                    "success")
                                }
                              >
                                {sentenceCase(row.status)}
                              </Label>
                            </TableCell>

                            <TableCell align="right">
                              {renderResourceButtons(row)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>

                    {noResultsFound && (
                      <TableBody>
                        <TableRow>
                          <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                            <SearchNotFound searchQuery={filterName} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </TableContainer>
              </Scrollbar>
            </Card>
          </Container>
        </Page>
      )}
    </>
  );
}
