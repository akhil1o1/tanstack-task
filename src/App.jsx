/* eslint-disable react/prop-types */
import {
   QueryClient,
   QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Table from "./components/Table";
import "./App.css";

const queryClient = new QueryClient();

export default function App() {
   return (
      <QueryClientProvider client={queryClient}>
      <Table/>
         <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
   );
}
