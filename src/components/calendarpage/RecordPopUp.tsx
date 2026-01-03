"use client";

import React from "react";
import styled from "styled-components";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

type RecordPopUpProps = {
    open?: boolean;
    onClose?: () => void;
};

export default class RecordPopUp extends React.Component<RecordPopUpProps> {
    static Overlay = styled.div`
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
        padding: 16px;
        z-index: 1000;
    `;

    static Card = styled.div`
        width: min(380px, calc(100% - 32px));
        background: #fff;
        border-radius: 18px;
        padding: 18px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
        display: grid;
        gap: 16px;

        .title {
            text-align: center;
            font-size: 18px;
            font-weight: 600;
            color: #000;
        }

        .pet-row {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .pet-avatar {
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: #b5b5b5;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
        }

        .pet-icon {
            width: 26px;
            height: 26px;
        }

        .field {
            display: grid;
            gap: 6px;
        }

        .pet-field {
            flex: 1;
        }

        .label {
            font-size: 16px;
            font-weight: 600;
            color: #000;
        }

        .select-wrap,
        .input-wrap {
            position: relative;
        }

        .select {
            width: 100%;
            height: 42px;
            border: 1px solid #d3d3d3;
            border-radius: 8px;
            padding: 0 38px 0 12px;
            font-size: 14px;
            color: #4d4d4d;
            background: #fff;
            appearance: none;
        }

        .select-icon {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b6b6b;
            pointer-events: none;
        }

        .input {
            width: 100%;
            height: 40px;
            border: 1px solid #d3d3d3;
            border-radius: 8px;
            padding: 0 12px 0 36px;
            font-size: 14px;
            color: #4d4d4d;
            background: #fff;
        }

        .textarea {
            width: 100%;
            min-height: 110px;
            border: 1px solid #d3d3d3;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 14px;
            color: #4d4d4d;
            resize: none;
            background: #fff;
        }

        .input-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b6b6b;
            pointer-events: none;
        }

        .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .image-box {
            width: 180px;
            height: 180px;
            border: 1px solid #d3d3d3;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
        }

        .image-plus {
            position: relative;
            width: 34px;
            height: 34px;
        }

        .image-plus::before,
        .image-plus::after {
            content: "";
            position: absolute;
            background: #4d4d4d;
            border-radius: 2px;
        }

        .image-plus::before {
            width: 4px;
            height: 34px;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
        }

        .image-plus::after {
            width: 34px;
            height: 4px;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
        }

        .submit {
            height: 46px;
            border-radius: 999px;
            border: none;
            background: #09bff8;
            color: #fff;
            font-size: 18px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 6px 14px rgba(9, 191, 248, 0.35);
        }
    `;

    handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && this.props.onClose) {
            this.props.onClose();
        }
    };

    render() {
        const isOpen = this.props.open ?? true;

        if (!isOpen) {
            return null;
        }

        return (
            <RecordPopUp.Overlay onClick={this.handleOverlayClick}>
                <RecordPopUp.Card>
                    <div className="title">Create Record</div>
                    <div className="pet-row">
                        <div className="pet-avatar" aria-hidden="true">
                            <img className="pet-icon" src="/pet-paw.svg" alt="" />
                        </div>
                        <div className="field pet-field">
                            <label className="label" htmlFor="record-pet">
                                Pet
                            </label>
                            <div className="select-wrap">
                                <select id="record-pet" className="select" defaultValue="">
                                    <option value="" disabled>
                                        Select your pet
                                    </option>
                                    <option value="lee">Lee</option>
                                    <option value="milo">Milo</option>
                                </select>
                                <KeyboardArrowDownIcon className="select-icon" fontSize="small" />
                            </div>
                        </div>
                    </div>
                    <div className="two-col">
                        <div className="field">
                            <label className="label" htmlFor="record-date">
                                Date
                            </label>
                            <div className="input-wrap">
                                <CalendarMonthIcon className="input-icon" fontSize="small" />
                                <input id="record-date" className="input" type="text" placeholder="Select date" />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label" htmlFor="record-time">
                                Time
                            </label>
                            <div className="input-wrap">
                                <AccessTimeIcon className="input-icon" fontSize="small" />
                                <input id="record-time" className="input" type="text" placeholder="Select time" />
                            </div>
                        </div>
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="record-note">
                            Note
                        </label>
                        <textarea id="record-note" className="textarea" placeholder="" />
                    </div>
                    <div className="field">
                        <label className="label" htmlFor="record-image">
                            Image
                        </label>
                        <div className="image-box" id="record-image" aria-label="Upload image">
                            <span className="image-plus" aria-hidden="true" />
                        </div>
                    </div>
                    <button className="submit" type="button">
                        Add New Record
                    </button>
                </RecordPopUp.Card>
            </RecordPopUp.Overlay>
        );
    }
}
