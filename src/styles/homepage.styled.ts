import styled from 'styled-components';

export const HomePageStyled = styled.div `
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    width: 100%;
    height: 100%;
    padding: 8px 24px;
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

        .head {
            color: #000;
            font-size: 18px;
            font-weight: 500;
        }

        .sub {
            color: #000000ae;
            font-size: 14px;
            font-weight: 500;
        }
    }
    .pet-list{
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #F7F7F7;
    }
`;
