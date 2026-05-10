import MenuTop from "./MenuTop"
import TitleHeader from "./TitleHeader"
const MenuHeader = () => {
  const isAdmin = false
  return (
    <div>
      <TitleHeader />
      {!isAdmin && <MenuTop />}
    </div>
  )
}

export default MenuHeader
