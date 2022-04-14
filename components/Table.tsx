import React, { useState } from "react"
import {
  useTable,
  useAsyncDebounce,
  useGlobalFilter,
  usePagination,
  useSortBy
} from "react-table"
import {
  SearchIcon,
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon
} from "@heroicons/react/solid"

import InputGroup from "@/components/InputGroup"
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/outline"

type TableProps = {
  columns: Array<any>
  data: Array<any>
  getRowProps?: any
  searchPlaceholder?: string
  toolbar?: React.ReactNode
}

function GlobalFilter({ globalFilter, setGlobalFilter, searchPlaceholder }) {
  // const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)

  const handleChange = e => {
    setValue(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
      <InputGroup
        prepend={<SearchIcon />}
        value={value || ""}
        onChange={handleChange}
        placeholder={searchPlaceholder}
        type="search"
      />
    </div>
  )
}

const defaultPropGetter = () => ({})
const Table: React.FC<TableProps> = ({
  columns,
  data,
  getRowProps = defaultPropGetter,
  searchPlaceholder = "Buscar",
  toolbar
}) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    canPreviousPage,
    canNextPage,
    pageOptions,
    // pageCount,
    previousPage,
    nextPage,
    // setPageSize,
    state: { pageIndex }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  )

  // Render the UI for your table
  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="flex flex-col-reverse items-start justify-between gap-2 py-4 px-4 sm:flex-row sm:items-center md:px-6 lg:px-8">
          <GlobalFilter
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
            searchPlaceholder={searchPlaceholder}
          />
          <div className="flex w-full flex-row justify-end">{toolbar}</div>
        </div>
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <table
            {...getTableProps()}
            className="min-w-full divide-y divide-gray-300"
          >
            <thead>
              {headerGroups.map((headerGroup, n) => (
                <tr key={n} {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, m) => (
                    <th
                      key={m}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                    >
                      {column.render("Header")}
                      {/* Add a sort direction indicator */}
                      <span className="ml-2">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <ArrowDownIcon className="inline h-4 w-4" />
                          ) : (
                            <ArrowUpIcon className="inline h-4 w-4" />
                          )
                        ) : (
                          ""
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
              {...getTableBodyProps()}
              className="divide-y divide-gray-200"
            >
              {page.map((row, i) => {
                prepareRow(row)
                return (
                  <tr
                    key={i}
                    {...row.getRowProps(getRowProps(row))}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {row.cells.map((cell, j) => {
                      return (
                        <td
                          key={j}
                          {...cell.getCellProps()}
                          className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0"
                        >
                          {cell.render("Cell")}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <nav className="flex items-center justify-between py-3">
            <div className="hidden sm:block">
              <p className="text-sm leading-5 text-gray-700">
                {"Página "} <span className="font-medium">{pageIndex + 1}</span>{" "}
                {"de "}
                <span className="font-medium">{pageOptions.length}</span>
              </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  previousPage()
                }}
                disabled={!canPreviousPage}
                className={`${
                  canPreviousPage ? "text-gray-700" : "text-gray-500"
                } focus:shadow-outline-blue relative inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-100 active:text-gray-700`}
              >
                <ArrowNarrowLeftIcon height="16" width="16" className="mr-2" />
                {"Previo"}
              </button>
              <button
                type="button"
                onClick={() => {
                  nextPage()
                }}
                disabled={!canNextPage}
                className={`${
                  canNextPage ? "text-gray-700" : "text-gray-500"
                } focus:shadow-outline-blue relative ml-3 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-100 active:text-gray-700`}
              >
                {"Siguiente"}
                <ArrowNarrowRightIcon height="16" width="16" className="ml-2" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Table
