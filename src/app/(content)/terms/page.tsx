import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Términos de uso de la aplicación Cargo."
}

export default function TermsPage() {
  const application = "Biztro"
  return (
    <section className="prose prose-gray mt-10 dark:prose-invert">
      <h1>Términos de uso</h1>
      <h2 className="font-medium text-gray-500">
        A partir del 1 de junio de 2024
      </h2>
      <ol>
        <li>
          <p>
            <strong>Acuerdo.</strong> Los siguientes Términos de servicio (los{" "}
            <strong>&quot;Términos&quot;</strong> ) constituyen un acuerdo
            vinculante entre usted y {application} Software ({" "}
            <strong>&quot;{application}&quot;,</strong>{" "}
            <strong>&quot;nosotros&quot;,</strong>{" "}
            <strong>&quot;nuestro&quot;</strong> y{" "}
            <strong>&quot;nos&quot;</strong> ), el operador de la plataforma
            {application} (la <strong>&quot; Plataforma&quot;</strong> ). Estos
            Términos establecen condiciones con respecto a su acceso y uso de la
            Plataforma.
          </p>
          <p>
            Al acceder o utilizar la Plataforma de cualquier manera, usted
            acepta estar sujeto a estos Términos.
          </p>
          <p>
            Su acceso y uso de la Plataforma se realiza en nombre de una o más
            organizaciones a las que está afiliado (cada una, una{" "}
            <strong>&quot;Organización&quot;</strong> ). {application} y cada
            una de las Organizaciones han celebrado un acuerdo separado (el{" "}
            <strong>“Acuerdo de Organización”</strong> ) que rige la prestación
            de servicios de {application} a esa Organización. Estos Términos no
            alteran de ninguna manera los términos de los Acuerdos de
            Organización. En la medida en que estos Términos entren en conflicto
            con los Acuerdos de organización, prevalecerán los términos de los
            Acuerdos de organización.
          </p>
        </li>
        <li>
          <p>
            <strong>Modificación.</strong> {application} se reserva el derecho,
            a su exclusivo criterio, de modificar estos Términos en cualquier
            momento y sin previo aviso. La fecha de la última modificación de
            los Términos se publicará al comienzo de estos Términos. Es su
            responsabilidad comprobar periódicamente si hay actualizaciones. Al
            continuar accediendo o utilizando la Plataforma, usted indica que
            acepta estar sujeto a los Términos modificados.
          </p>
        </li>
        <li>
          <strong>Privacidad.</strong> Estos Términos incluyen las disposiciones
          de este documento, así como las de nuestra{" "}
          <Link href="/privacy">Política de Privacidad</Link>.
        </li>
        <li>
          <p>
            <strong>Uso Aceptable.</strong> Por el presente, {application} le
            otorga permiso para acceder y utilizar la Plataforma, siempre que
            dicho uso cumpla con estos Términos y, además, acepta
            específicamente que su uso cumplirá con las siguientes restricciones
            y obligaciones:
          </p>
          <ul>
            <li>
              Solo puede utilizar la Plataforma en nombre de las Organizaciones
              y solo según lo permitido en los Acuerdos de la Organización.
            </li>
            <li>
              No puede transferir su acceso a otros ni permitir que otros
              accedan a la Plataforma a través de su propio acceso.
            </li>
            <li>
              Sólo puede utilizar la Plataforma para actividades legales. Es su
              responsabilidad cumplir con todas las leyes y regulaciones
              locales, estatales y federales aplicables.
            </li>
            <li>
              No puede descompilar, realizar ingeniería inversa ni intentar
              obtener el código fuente o las ideas subyacentes o información de
              la Plataforma o relacionada con ella.
            </li>
            <li>
              No puede ingresar, almacenar ni transmitir virus, gusanos u otros
              códigos maliciosos dentro, a través de, hacia o utilizando la
              Plataforma.
            </li>
            <li>
              No puede anular, evitar, eludir, eliminar, desactivar ni eludir de
              otro modo ningún mecanismo de protección de software en la
              Plataforma.
            </li>
            <li>
              No puede eliminar ni ocultar ninguna identificación de producto,
              derechos de autor u otro aviso de propiedad de ningún elemento de
              la Plataforma o documentación asociada.
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>Cuentas de usuario.</strong> Puede crear una cuenta
            iniciando sesión en su cuenta con ciertas plataformas de terceros
            (&quot;Autenticadores de terceros&quot;, incluido, entre otros,
            Google). El Autenticador de terceros determinará a qué información
            podremos acceder y utilizar. Su cuenta de {application} se creará
            para su uso de la Plataforma en función de la información personal
            que nos proporcione o que obtengamos a través del Autenticador de
            terceros.
          </p>
          <p>
            Usted y las Organizaciones son responsables de mantener la
            confidencialidad de su contraseña y cuenta, y son totalmente
            responsables de todas y cada una de las actividades que ocurran bajo
            su contraseña o cuenta. Usted acepta (a) notificar inmediatamente a
            {application} sobre cualquier uso no autorizado de su contraseña o
            cuenta o cualquier otra violación de seguridad, y (b) asegurarse de
            salir de su cuenta al final de cada sesión cuando acceda a la
            Plataforma.
            {application} no será responsable de ninguna pérdida o daño que
            surja del incumplimiento de esta sección.
          </p>
          <p>
            Si desea que cancelemos su cuenta, siga los procedimientos
            establecidos en nuestra{" "}
            <Link href="/privacy">Política de Privacidad.</Link>
          </p>
          <p>
            No puede transferir su cuenta a nadie más sin nuestro permiso previo
            por escrito.
          </p>
        </li>
        <li>
          <p>
            <strong>Contenido.</strong> Cada Organización es propietaria de todo
            el contenido que envía a través de la Plataforma, incluido cualquier
            contenido que usted u otros representantes de la Organización envíen
            a través de la Plataforma (colectivamente, el{" "}
            <strong>&quot;Contenido de la Organización&quot;</strong> ).{" "}
          </p>
          <p>
            No puede usar, copiar, adaptar, modificar, preparar trabajos
            derivados basados ​​en, distribuir, licenciar, vender, transferir,
            exhibir públicamente, transmitir, difundir o explotar de otro modo
            el Contenido del {application}, excepto cuando sea necesario para
            acceder y utilizar la Plataforma en nombre de las Organizaciones de
            conformidad con estos Términos y los Acuerdos de Organización.
          </p>
        </li>
        <li>
          <p>
            <strong>Aplicaciones de terceros.</strong> Usted o las
            Organizaciones pueden optar por utilizar ciertos productos o
            servicios de terceros en relación con la Plataforma (las{" "}
            <strong>“Aplicaciones de Terceros”</strong> ). Su uso de cualquier
            Aplicación de terceros está sujeto a un acuerdo separado entre la
            Organización correspondiente y el proveedor de esa Aplicación de
            terceros (el <strong>&quot;Proveedor externo&quot;</strong> ) o
            usted y el Proveedor externo. Por la presente, reconoce que{" "}
            {application} no controla dichos Proveedores externos o Aplicaciones
            de terceros, y no se hace responsable de su contenido, operación o
            uso. {application} no realiza ninguna representación, garantía o
            respaldo, expreso o implícito, con respecto a la legalidad,
            exactitud, calidad o autenticidad del contenido, la información o
            los servicios proporcionados por las aplicaciones de terceros. POR
            EL PRESENTE,
            {application} RENUNCIA A TODA RESPONSABILIDAD POR CUALQUIER
            APLICACIÓN DE TERCEROS Y POR LOS ACTOS U OMISIONES DE CUALQUIER
            PROVEEDOR DE TERCEROS, y por la presente usted renuncia
            irrevocablemente a cualquier reclamo contra {application} con
            respecto al contenido o el funcionamiento de cualquier Aplicación de
            terceros.
          </p>
        </li>
        <li>
          <strong>Comentario.</strong> Le damos la bienvenida y le animamos a
          que proporcione su opinión, comentarios y sugerencias para mejorar la
          Plataforma ( <strong>&quot;Comentarios&quot;</strong> ). Usted acepta
          que {application} tiene el derecho, pero no la obligación, de utilizar
          dichos Comentarios sin ninguna obligación de proporcionarle crédito,
          pago de regalías o interés de propiedad en los cambios en la
          Plataforma.
        </li>
        <li>
          <p>
            <strong>Terminación.</strong> {application} puede rescindir
            inmediatamente y sin previo aviso estos Términos e inhabilitar su
            acceso a la Plataforma si {application} determina, a su entera
            discreción, que (a) usted ha violado estos Términos, o (b) ha
            violado las leyes, regulaciones o derechos de terceros aplicables. .
            Además, si todos los Acuerdos de organización vencen o se rescinden
            por cualquier motivo, {application}
            rescindirá inmediatamente estos Términos y su acceso a la
            Plataforma. {application} podrá suspender temporalmente su acceso a
            la Plataforma en determinadas circunstancias establecidas en los
            Acuerdos de Organización.
          </p>
          <p>
            Las disposiciones que, por su naturaleza, deberían sobrevivir a la
            terminación de estos Términos seguirán vigentes. A modo de ejemplo,
            todo lo siguiente sobrevivirá a la terminación: cualquier limitación
            de nuestra responsabilidad, cualquier término relacionado con la
            propiedad o los derechos de propiedad intelectual y los términos
            relacionados con las disputas entre nosotros.
          </p>
        </li>
        <li>
          <p>
            <strong>Renuncia de Garantías.</strong> POR LA PRESENTE USTED
            RECONOCE QUE ESTÁ UTILIZANDO LA PLATAFORMA BAJO SU PROPIO RIESGO. LA
            PLATAFORMA Y EL CONTENIDO DE {application} SE PROPORCIONAN &quot;TAL
            CUAL&quot;, Y {application}, SUS AFILIADOS Y SUS PROVEEDORES DE
            SERVICIOS TERCEROS POR EL PRESENTE RECHAZAN CUALQUIER GARANTÍA,
            EXPRESA E IMPLÍCITA, INCLUYENDO, PERO NO LIMITADO A, CUALQUIER
            GARANTÍA DE EXACTITUD, CONFIABILIDAD, COMERCIABILIDAD, NO
            INFRACCIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y CUALQUIER OTRA
            GARANTÍA, CONDICIÓN O DECLARACIÓN, YA SEA ORAL, POR ESCRITO O EN
            FORMA ELECTRÓNICA. {application}, SUS AFILIADOS Y SUS TERCEROS
            PROVEEDORES DE SERVICIOS NO DECLARA NI GARANTIZAN QUE EL ACCESO A LA
            PLATAFORMA SERÁ ININTERRUMPIDO O QUE NO HABRÁ FALLAS, ERRORES U
            OMISIONES O PÉRDIDA DE INFORMACIÓN TRANSMITIDA, O QUE NO SE
            TRANSMITIRÁN VIRUS A TRAVÉS DEL PLATAFORMA.
          </p>
          <p>
            Debido a que algunos estados no permiten la renuncia de garantías
            implícitas, es posible que tenga derechos adicionales según las
            leyes locales.
          </p>
        </li>
        <li>
          <p>
            <strong>Limitación de responsabilidad.</strong> SU ACCESO Y USO DE
            LA PLATAFORMA ES EN NOMBRE DE UNA O MÁS ORGANIZACIONES. EN
            CONSECUENCIA, EN LA MEDIDA MÁXIMA PERMITIDA POR LA LEY APLICABLE,
            BAJO NINGUNA CIRCUNSTANCIA Y BAJO NINGUNA TEORÍA LEGAL (INCLUYENDO,
            SIN LIMITACIÓN, AGRAVIO, CONTRATO, RESPONSABILIDAD ESTRICTA O DE
            OTRA MANERA), {application} (O SUS LICENCIANTES O PROVEEDORES) SERÁ
            RESPONSABLE ANTE USTED POR CUALQUIER DAÑOS DIRECTOS, INDIRECTOS,
            ESPECIALES, INCIDENTALES O CONSECUENCIALES DE CUALQUIER TIPO,
            INCLUYENDO DAÑOS POR PÉRDIDA DE BENEFICIOS, PÉRDIDA DE BUENA
            VOLUNTAD, PARO LABORAL, EXACTITUD DE LOS RESULTADOS O FALLA O MAL
            FUNCIONAMIENTO DE LA COMPUTADORA.
          </p>
        </li>
        <li>
          <strong>Avisos.</strong> Cualquier aviso u otra comunicación permitida
          o requerida en virtud del presente se realizará por escrito y será
          entregada por {application} (a) por correo electrónico (en cada caso a
          la dirección que usted proporcione) o (b) mediante publicación en el
          sitio web.
        </li>
        <li>
          <strong>No renuncio.</strong> El hecho de que {application} no haga
          cumplir cualquier derecho o disposición de estos Términos no
          constituirá una renuncia a la aplicación futura de ese derecho o
          disposición.
        </li>
        <li>
          <strong>Asignación.</strong> No puede ceder ni transferir estos
          Términos, por aplicación de la ley o de otro modo, sin el
          consentimiento previo por escrito de {application}. Cualquier intento
          por su parte de ceder o transferir estos Términos sin dicho
          consentimiento será nulo y sin efecto. {application} puede ceder o
          transferir estos Términos, a su exclusivo criterio, sin restricciones.
          Sujeto a lo anterior, estos Términos vincularán y redundarán en
          beneficio de las partes, sus sucesores y cesionarios permitidos. A
          menos que una persona o entidad se identifique explícitamente como un
          tercero beneficiario de estos Términos, estos Términos no confieren ni
          tienen la intención de conferir ningún derecho o recurso a ninguna
          persona o entidad que no sean las partes.
        </li>
        <li>
          <strong>Divisibilidad.</strong> Si por algún motivo un árbitro o un
          tribunal de jurisdicción competente determina que alguna disposición
          de estos Términos es inválida o inaplicable, esa disposición se
          aplicará en la medida máxima permitida y las demás disposiciones de
          estos Términos permanecerán en pleno vigor y efecto.
        </li>
        <li>
          <strong>Ley que rige.</strong> Las leyes del Estado de California, sin
          referencia a su elección o ley o reglas o principios de conflicto de
          leyes, regirán estos Términos y cualquier disputa de cualquier tipo
          que pueda surgir entre usted y {application} con respecto a estos
          Términos. Sin perjuicio de lo anterior, usted reconoce que, dado que
          su acceso y uso de la Plataforma se realiza en nombre de una o más
          Organizaciones y está sujeto a los Acuerdos de la Organización,
          cualquier disputa que surja de su uso de la Plataforma se manejará de
          acuerdo con el proceso de resolución de disputas. establecidos en los
          Acuerdos de Organización aplicables.
        </li>
        <li>
          <strong>Acuerdo completo.</strong> Estos Términos constituyen el
          acuerdo completo entre usted y {application} con respecto a su uso de
          la Plataforma, y reemplazan todos los acuerdos anteriores, escritos u
          orales, distintos de los Acuerdos de organización.
        </li>
        {/* <li>
          <strong>Contáctenos.</strong> Si tiene alguna pregunta sobre la
          Plataforma, no dude en contactarnos en soporte@{application}hq.co o en
          nuestra <Link href="/contact">página de contacto</Link> .
        </li> */}
      </ol>
    </section>
  )
}
