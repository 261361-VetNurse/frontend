"use client"
import styled from "styled-components";
import ProflieCom from "@/components/homepage/pet-proflie";

const Box = styled.div `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: red;
    padding: 8px 24px;
    gap: 16px;

    .header-box{
        width: 348px;
        height: 50px;
        background-color: #F7F7F7;
        gap: 10px;
        display: flex;
        align-items: center;
    }
    .mypet-box{
        width: 348px;
        background-color: #F7F7F7;
        display: flex;
        align-items: center;
    }
    .pet-list{
        display: flex;
        align-items: center;
        gap: 11px;
    }
`;

export default function HomePage() {
    return(
        <Box>
            <div className="header-box">
                <img src="/Ava.svg" alt="Ava" />
                <span>Hi!</span>
                <span>username</span>
                <img src="/help.svg" alt="help" className="ml-auto" />
            </div>
            <div className="mypet-box">
                <div>My Pets</div>
                <div className="ml-auto w-[64px]">show all</div>
                <img src="/next-icon.svg" alt="next-icon" />
            </div>
            <div className="pet-list">
                <ProflieCom/>
                <ProflieCom/>
                <ProflieCom/>
                <ProflieCom/>
                <ProflieCom/>
            </div>
        </Box>
    );
}
