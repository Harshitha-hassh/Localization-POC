import { TranslogType } from "./report.modals";

//export const TransLogBuilder {
 export const translog :TranslogType[]= [
    {
        "id": 1,
        "code": "ClientCreate",
        "description": "",
        "logtype": "Client Create"
    },
    {
        "id": 2,
        "code": "ClientEdit",
        "description": "",
        "logtype": "Client Edit"
    },
    {
        "id": 3,
        "code": "RetailCodeCreate",
        "description": "",
        "logtype": "Retail Code Create"
    },
    {
        "id": 4,
        "code": "RetailCodeEdit",
        "description": "",
        "logtype": "Retail Code Edit"
    },
    {
        "id": 5,
        "code": "RetailCodeDelete",
        "description": "",
        "logtype": "Retail Code Delete"
    },
    {
        "id": 6,
        "code": "RetailTransactionCreate",
        "description": "",
        "logtype": "Retail Transaction Create"
    },
    {
        "id": 7,
        "code": "RetailTransactionSettle",
        "description": "",
        "logtype": "Retail Transaction Settle"
    },
    {
        "id": 8,
        "code": "RetailTransactionVoid",
        "description": "",
        "logtype": "Retail Transaction Void"
    },
    {
        "id": 9,
        "code": "RetailTransactionReturn",
        "description": "",
        "logtype": "Retail Transaction Return"
    },
    {
        "id": 10,
        "code": "SignIn",
        "description": "",
        "logtype": "Sign In"
    },
    {
        "id": 11,
        "code": "SignOut",
        "description": "",
        "logtype": "Sign Out"
    },
    {
        "id": 12,
        "code": "UserCreate",
        "description": "",
        "logtype": "User Create"
    },
    {
        "id": 13,
        "code": "UserEdit",
        "description": "",
        "logtype": "User Edit"
    },
    {
        "id": 14,
        "code": "UserDelete",
        "description": "",
        "logtype": "User Delete"
    },
    {
        "id": 15,
        "code": "DayEnd",
        "description": "",
        "logtype": "Day End"
    }
]


