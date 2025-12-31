import styled from "styled-components";

const BoxWrap = styled.div`
    display: flex;
    width: 100%;

    .ListBox{
        display: flex;
        padding: 12px 20px;
        justify-content: space-between;
        align-items: center;
        align-self: stretch;
        border-radius: 16px;
        background: #FFF;
        //box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.2);
        border: none;
        width: 100%;
        height: 66px;
        cursor: pointer;
        gap: 16px;
    }

    .ListBoxContent{
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
    }

    .ListBoxIcon{
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #B9B9B9;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
    }

    .ListBoxText{
        color: #000;
        font-size: 18px;
        font-weight: 400;
    }
`;

export default function PetList() {
    return(
        <BoxWrap>
            <button className='ListBox' type="button" aria-label="Select pet filter">
            <div className="ListBoxContent">
                <div className="ListBoxIcon" aria-hidden="true">
                    <img src="/pet-paw.svg" alt="pet-paw" className="w-[30px] h-[30px]" />
                </div>
                <span className="ListBoxText">All Pets</span>
            </div>
            <img src="/down-icon.svg" alt="down-icon" />
        </button>
        </BoxWrap>
    );
}