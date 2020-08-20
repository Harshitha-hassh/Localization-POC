export interface OutletOption {
    id: number;
    name: string;
    description: string;
    defaultOutletId : number;
}

export interface DonutCount {
    active: number;
    inActive: number;
    total : number;
}

export interface TransactionSaleDetail {
    noOfTrasaction: number;
    totalAmount: number;
    dateOfTransaction: Date;
    id: number;
    name:string;
}

export interface ItemData {
    id: number;
    amount: number;
    name:string;
}
export interface UIItemData {
    id: number;
    amount: string;
    name:string;
}

// export interface CourseCount {
//     activeCourses: number;
//     inActiveCourses: number;
//     totalCourses : number;
// }

// export interface TeeTimesCount {
//     availableTeeTimesCount: number;
//     cancelledTeeTimesCount: number;
// }

// export interface PlayersCount {
//     newPlayersCount: number;
//     repeatPlayersCount: number;
// }

// export interface UITournamentDetails {
//     Id: number;
//     Players: number;
//     EventName: string;
//     Date: string;
//     Course: string;
// }

// export interface TournamentDetails {
//     Id: number;
//     PlayersCount: number;
//     EventName: string;
//     EventDate: Date;
//     CourseName: string;
// }

// export interface LessonDetails {
//     playersCount: number;
//     instructorName: string;
//     eventDate: Date;
//     startTime: Date;
//     endTime: Date;
//     firstName:string;
//     lastName:string;    
// }

// export interface UILessonDetails {
//     players: number;
//     instructor: string;
//     date: string;
//     time: string;   
// }

// export interface CourseUtilization {
//     date: Date;
//     total: number;
//     booked: number;
//     avail: number;
//     percentage: number;
// }

// export interface UICourseUtilization {
//     date: string;
//     total: number;
//     Booked: number;
//     Available: number;
//     percentage: number;
// }



// export interface CategoryData {
//     id: number;
//     amount: number;
//     name:string;
// }

// export interface OutletData {
//     id: number;
//     amount: number;
//     name:string;
//     noOfTransaction: number;
// }

// export interface UIOutletData {
//     id: number;
//     amount: string;
//     name:string;
//     noOfTransaction: number;
// }

// export interface TransactionSaleDetail {
//     noOfTrasaction: number;
//     totalAmount: number;
//     dateOfTransaction: Date;
//     id: number;
//     name:string;
// }

// export interface UITransactionSaleDetail {
//     noOfTrasaction: number;
//     totalAmount: string;
//     dateOfTransaction: Date;
// }

// export interface WaitlistDetail {
//     playerName: string;
//     courseName: string;
//     phoneNumber: string;
//     date: Date;
//     firstName:string;
//     lastName:string;  
// }

// export interface UIWaitlistDetail {
//     player: string;
//     course: string;
//     phoneNumber: string;
//     date: string;
// }

// export interface DefaultDetail {
//     startTime: Date;
//     endTime: Date;
//     courseId: number;
// }

// export interface TimeDetail {
//     startTime: Date | string;
//     endTime: Date | string;
// }

// export interface OutletOption {
//     id: number;
//     name: string;
//     description: string;
// }

export interface UIRevenue{
    value : number;
    transactions:number;
    name:string;
}

export interface UIWeekArray{
    id:number;
    name:string;
}



export interface UICategoryData {
    id: number;
    amount: string;
    name:string;
}
