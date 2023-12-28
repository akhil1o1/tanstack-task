import axios from "axios";
import { nanoid } from "nanoid";
import { useQuery } from "@tanstack/react-query";
import { GridLoader } from "react-spinners";
import {
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

const override = {
   display: "block",
   margin: "0 auto",
   borderColor: "red",
};

const columns = [
   {
      accessorKey: "name",
      header: "Name",
      cell: (props) => <p>{props.getValue()?.common}</p>,
      sortingFn: "myCustomSorting",
      enableColumnFilter: true,
      filterFn: "includesString",
      enableSorting: true,
   },
   {
      accessorKey: "capital",
      header: "Capital",
      cell: (props) => {
         const value = props.getValue();
         const capital = value && value.length > 0 ? value[0] : "";
         return <p>{capital}</p>;
      },
      enableSorting: false,
   },
   {
      accessorKey: "region",
      header: "Region",
      cell: (props) => <p>{props.getValue()}</p>,
      enableSorting: false,
   },
   {
      accessorKey: "population",
      header: "Population",
      cell: (props) => <p>{props.getValue()}</p>,
   },
   {
      accessorKey: "languages",
      header: "Languages",
      cell: (props) => {
         const languages = props.getValue()
            ? Object.values(props.getValue())
            : ["not available"];
         // console.log(languages);
         return <p>{languages.toString().replaceAll(",", ", ")}</p>;
      },
      enableSorting: false,
   },
];

function Table() {
   const [countriesData, setCountriesData] = useState([]);
   const [columnFilters, setColumnFilters] = useState([]);
   const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
   const [sorting, setSorting] = useState([]);

   const includesStringFilter = (row, columnId, filterValue) => {
      const value = row.getValue(columnId).common;
      return value.toLowerCase().startsWith(filterValue.toLowerCase());
   };

   const table = useReactTable({
      data: countriesData,
      columns: columns.map((column) => ({
         ...column,
         filterFn:
            column.filterFn === "includesString"
               ? includesStringFilter
               : column.filterFn,
      })),
      state: {
         columnFilters,
         pagination,
         sorting,
      },
      sortingFns: {
         myCustomSorting: (rowA, rowB, columnId) =>
            rowA
               .getValue(columnId)
               .common.localeCompare(
                  rowB.getValue(columnId).common,
                  undefined,
                  { sensitivity: "base" }
               ),
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      debugTable: true,
   });

   const countryQuery = useQuery({
      queryKey: ["countries"],
      queryFn: async () => {
         const response = await axios.get("https://restcountries.com/v3.1/all");
         const data = response.data;
         setCountriesData(data);
         return data;
      },
   });

   // console.log(countriesData);
   // console.log(countryQuery);
   console.log(columnFilters);

   const handleFilter = (id, value) =>
      setColumnFilters((prev) => {
         const existingFilter = prev.find((filter) => filter.id === id);
         if (existingFilter) {
            return prev.map((filter) => (filter.id === id ? { ...filter, value } : filter));
         } else {
            return [...prev, { id, value }];
         }
      });

   const handlePagination = (value) => {
      console.log(value);
      if (value === "previous") {
         setPagination((prevPagination) => ({
            ...prevPagination,
            pageIndex: prevPagination.pageIndex - 1,
         }));
      } else if (value === "next") {
         setPagination((prevPagination) => ({
            ...prevPagination,
            pageIndex: prevPagination.pageIndex + 1,
         }));
      } else {
         setPagination((prevPagination) => ({
            ...prevPagination,
            pageSize: value,
         }));
      }
   };

   if (countryQuery.isLoading)
      return (
         <div className="loader_container">
            <div>
               <GridLoader
                  color={"#000"}
                  loading={countryQuery.isLoading}
                  cssOverride={override}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
               />
            </div>
         </div>
      );
   if (countryQuery.isError)
      return (
         <div className="loader_container">
            <div>
               <h1>Error loading data!!!</h1>
            </div>
         </div>
      );

   // console.log(table.getHeaderGroups()[0].headers);
   const headers = table.getHeaderGroups()[0].headers;

   console.log(table.getRowModel());

   return (
      <div>
         <h1 className="table_heading">Countries data</h1>
         <input
            onChange={(e) => handleFilter("name", e.target.value)}
            value={columnFilters[0]?.value || ""}
            type="text"
            placeholder="search country name"
         />
         <p>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
         </p>
         <div>
            <button
               onClick={() => handlePagination("previous")}
               disabled={!table.getCanPreviousPage()}
            >
               {"<"}
            </button>{" "}
            <button
               onClick={() => handlePagination("next")}
               disabled={!table.getCanNextPage()}
            >
               {">"}
            </button>
            <br />
            <br />
            table size :{" "}
            <button onClick={() => handlePagination(15)}>15</button>{" "}
            <button onClick={() => handlePagination(50)}>50</button>{" "}
            <button onClick={() => handlePagination(100)}>100</button>
         </div>
         <div>
            <table border={"1"} className="table">
               <thead>
                  <tr>
                     {headers.map((header) => (
                        <th key={nanoid()}>
                           {header.column.columnDef.header}
                           {header.column.getCanSort() && (
                              <button
                                 onClick={header.column.getToggleSortingHandler()}
                              >
                                 Sort
                              </button>
                           )}
                           {
                              {
                                 asc: " 🔼",
                                 desc: " 🔽",
                              }[header.column.getIsSorted()]
                           }
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {table.getRowModel().rows.map((row) => (
                     <tr key={nanoid()}>
                        {row.getVisibleCells().map((cell) => (
                           <td key={nanoid()}>
                              {flexRender(
                                 cell.column.columnDef.cell,
                                 cell.getContext()
                              )}
                           </td>
                        ))}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}

export default Table;
