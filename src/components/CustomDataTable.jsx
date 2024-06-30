import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { flexRender } from "@tanstack/react-table";
import React from "react";

const CustomDataTable = ({ table, colors, totalElements }) => {
  return (
    <Box
      sx={{
        "& .MuiTableCell-root": {
          border: "none",
          fontSize: "13px",
        },
        "& .MuiTableCell-head": {
          bgcolor: colors.blueAccent[700],
          fontWeight: "bold",
        },
        "& .MuiTableBody-root": {
          bgcolor: colors.primary[400],
        },
      }}
    >
      <TableContainer
        sx={{
          height: "55vh",
          borderRadius: "8px",
        }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sx={{
                      textAlign: "center",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow hover={true} role="checkbox" tabIndex={-1} key={row.id}>
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    sx={{
                      color: colors.grey[100],
                      textAlign:
                        table.getHeaderGroups()[0].headers[index].column
                          .columnDef?.align,
                    }}
                  >
                    <Tooltip
                      arrow
                      enterDelay={500}
                      // leaveDelay={200}
                      title={
                        table.getHeaderGroups()[0].headers[index].column
                          .columnDef?.isEllipsis ? (
                          <Box>
                            <Typography component="h6" sx={{ padding: "4px" }}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </Typography>
                          </Box>
                        ) : undefined
                      }
                    >
                      <Box display="flex" justifyContent="center">
                        <Typography
                          display="block"
                          position="relative"
                          width={
                            table.getHeaderGroups()[0].headers[index].column
                              .columnDef?.width
                          }
                          noWrap={
                            table.getHeaderGroups()[0].headers[index].column
                              .columnDef?.isEllipsis
                          }
                          component="div"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt="20px" display="flex" justifyContent="center">
        <Box>
          <Pagination
            page={Number(table.getState().pagination.pageIndex + 1)}
            count={table.getPageCount()}
            onChange={(e, pageIndex) => {
              table.setPageIndex(pageIndex - 1);
            }}
          />
        </Box>
        <Box ml="10px" sx={{ minWidth: 100 }}>
          <FormControl fullWidth size="small" color="warning">
            <InputLabel id="pageSize">Size</InputLabel>
            <Select
              labelId="pageSize"
              id="page-size-select"
              value={table.getState().pagination.pageSize}
              label="Page size"
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={totalElements}>All</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
};

export default CustomDataTable;
