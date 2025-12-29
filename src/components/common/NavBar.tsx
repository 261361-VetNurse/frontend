import styled from "styled-components";

const NavBarWrap = styled.footer`
  display: flex;
  height: 60px;
  padding: 8px 24px;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 -2px 2px rgba(0,0,0,0.25);
`;
const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 64px;

  .nav-text{
    color: #000;
    text-align: center;
    font-size: 12px;
    font-weight: 400;
  }
`;

const navItems = [
    {label: "Home", icon:"/home-navbar.svg", href: "/homepage" },
    {label: "Calendar", icon: "/calendar-navbar.svg", href: "/appointmentpage"},
    {label: "My pets", icon: "/mypets-navbar.svg", href:"/homepage"},
    {label: "Community", icon: "/community-navbar.svg", href:"/homepage"},
    {label: "Notifications", icon: "/notifications-navbar.svg", href:"/homepage"}
];

export default function NavBar() {
  return (
    <NavBarWrap>
      {navItems.map((item) => (
        <NavItem key={item.label}>
          <img src={item.icon} alt={item.label} />
          <span className="nav-text">{item.label}</span>
        </NavItem>
      ))}
    </NavBarWrap>
  );
}
