import React from "react";
import Header from "./Header";
import Codeform from "./forms/Codeform";

function Codeenter(){

    return(
        <div className="min-h-screen flex flex-col items-center p-6">
        <Header></Header>
        <Codeform></Codeform>
        </div>
    );
}

export default Codeenter;