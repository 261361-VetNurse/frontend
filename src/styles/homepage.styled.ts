import styled from 'styled-components';

export const HomePageStyled = styled.div `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    width: 100%;
    height: 100%;
    margin-bottom: 60px;

    .header-box{
        width: 100%;
        height: 50px;
        gap: 10px;
        display: flex;
        align-items: center;
        span {
            font-size: 18px;
            color: #000;
        }
    }
    .head-section{
        width: 100%;
        background-color: #F7F7F7;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #000;

        .head-right {
            color: #000;
            font-size: 18px;
            font-weight: 500;
        }

        .head-left {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            cursor: pointer;
            .sub {
                color: #000000ae;
                font-size: 14px;
                font-weight: 500;
            }
        }
    }
    .pet-list{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #F7F7F7;
    }

    .reminder-box{
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-radius: 8px;
        overflow: hidden;
    }

    .appoint-box{
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
`;
