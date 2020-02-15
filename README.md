# LoanConnect Backend

## Start

Using `npm start`, the server will be started and listened on port 3000

# API

## Market Price API

GET /api/marketdata/:asset/price (Return market price in THB)
GET /api/marketdata/:asset/needed-amount/:thbAmount (Return asset amount needed for collate of thbAmount)

## Loan Request & Collateral API

POST /api/loans #(create loan)
GET /api/loans/:id/collaterals (List all collaterals)
POST /api/loans/:id/collaterals (Assigned a deposited collateral to a loan)
GET /api/loans/:id (Get loan information including collaterals so far)
POST /api/loans/:id/submit (Submit collateral-filled loan application)
GET /api/loans (List all loans)

## Fund Request API (TODO: )

POST /api/funds (create fund requests)
GET /api/funds?duration= (list fund requests sort by interest_rate asc)
GET /api/funds/:id

## Match API (TODO: )

# Model

## Loan Request Model

```
id:
user:
amount:
duration: 3 | 6 | 9 | 12
interest_rate: 0.10
collaterals: []
status: created | ready | requested | matched | completed
```

## Collateral

```
loan_id:
user:
asset:
amount:
status: waiting | deposited | returned
```

## Funding Request Model

```
id:
user:
amount:
duration: 3 | 6 | 9 | 12
interest_rate: 0.10
```

## Loan Model

```
loan_id:
fund_id:
paid_amount:
duration:
interest_rate:
```

## Market Data Model

```
asset: ETH
price: 100.0 (THB)
```
