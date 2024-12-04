# Moneyleh-excel-Addin

- Microsoft excel add in developed using vite instead of webpack. Based off of [this starter template](https://github.com/ExtraBB/Office-Addin-React-Vite-Template). With dependencies updated.
- Easily convert your bank statements into your excel sheet of choice.

> Singapore based financial statement parsing only

## How to

TODO: fill up this section

## Supported Statement Formats

1. DBS account csv statement
2. DBS credit card PDF statement
3. UOB credit card and account xls statements
4. HSBC credit card csv statement
5. Moomoo monthly PDF statement
6. IBKR Flex CSV Report
7. Chocolate Finance monthly PDF statement
8. CPF Monthly PDF statement
9. Trust bank credit card monthly PDF statement

## Develop

#### Prerequisites

1. MacOS or Windows only, no WSL as there is no support for it when you want to debug

#### Start up

1. To start the server run `npm run dev`
2. Then run `npm run start`, this should bring up a temporary excel spreadsheet with your add in attached so you can view the add in and debug.
3. Once done developing run `npm run stop`. You can also close the spreadsheet.

> For more information refer to the official docs [here](https://learn.microsoft.com/en-us/office/dev/add-ins/excel/).
