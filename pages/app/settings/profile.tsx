import Layout from "@/components/layouts/Layout"
import SettingsLayout from "@/components/layouts/SettingsLayout"
import { NextPageWithAuthAndLayout } from "@/lib/types"

const SettingsProfile: NextPageWithAuthAndLayout = () => {
  return (
      <div>Perfil</div>
  )
}

SettingsProfile.auth = true
SettingsProfile.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Layout>
      <SettingsLayout>{page}</SettingsLayout>
    </Layout>
  )
}

export default SettingsProfile
