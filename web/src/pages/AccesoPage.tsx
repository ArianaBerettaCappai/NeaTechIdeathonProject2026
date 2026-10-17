import { useState, type SyntheticEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import {
  ErrorApi,
  guardarSesion,
  iniciarSesion,
  leerEmailRecordado,
  recordarEmail,
  registrarse,
  type RegistroInput,
} from "../lib/api";

type Modo = "login" | "registro";
type Tono = "" | "error" | "success";
interface Mensaje {
  texto: string;
  tono: Tono;
}

const SIN_MENSAJE: Mensaje = { texto: "", tono: "" };

export function AccesoPage() {
  const [params] = useSearchParams();
  const [modo, setModo] = useState<Modo>(params.get("modo") === "registro" ? "registro" : "login");

  return (
    <Layout variante="acceso">
      <div className="auth-page">
        <div className="auth-main">
          <section className="auth-intro">
            <p className="eyebrow">VAKA RAPÉ · ACCESO A LA PLATAFORMA</p>
            <h1>
              Tu actividad ganadera,
              <br />
              <span>mejor organizada.</span>
            </h1>
            <p>
              Ingresá o registrate para organizar datos de tu establecimiento, lotes, animales, documentación sanitaria y
              evidencias de origen.
            </p>
            <div className="auth-benefits">
              <div>
                <span aria-hidden="true">✓</span>
                <span>
                  <strong>Información organizada</strong>
                  <small>Identificación, movimientos y documentos.</small>
                </span>
              </div>
              <div>
                <span aria-hidden="true">✓</span>
                <span>
                  <strong>Perfiles por actividad</strong>
                  <small>Productor, transporte, frigorífico o comprador.</small>
                </span>
              </div>
              <div>
                <span aria-hidden="true">✓</span>
                <span>
                  <strong>Seguimiento documental</strong>
                  <small>Un punto de partida para tu expediente digital.</small>
                </span>
              </div>
            </div>
            <p className="auth-illustration-note">Prototipo visual: la autenticación real requiere un servidor seguro.</p>
          </section>

          <section className="auth-card" aria-label="Formulario de acceso">
            <div className="auth-switch" role="tablist" aria-label="Elegir acceso o registro">
              <button
                type="button"
                role="tab"
                className="switch-tab"
                aria-selected={modo === "login"}
                aria-controls="loginPanel"
                onClick={() => setModo("login")}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                role="tab"
                className="switch-tab"
                aria-selected={modo === "registro"}
                aria-controls="registerPanel"
                onClick={() => setModo("registro")}
              >
                Registrarse
              </button>
            </div>

            {modo === "login" ? <PanelLogin onCambiar={() => setModo("registro")} /> : <PanelRegistro onCambiar={() => setModo("login")} />}
          </section>
        </div>
      </div>
    </Layout>
  );
}

function PanelLogin({ onCambiar }: { onCambiar: () => void }) {
  const [email, setEmail] = useState(() => leerEmailRecordado() ?? "");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(() => Boolean(leerEmailRecordado()));
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>(SIN_MENSAJE);

  const enviar = async (evento: SyntheticEvent) => {
    evento.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMensaje({ texto: "Ingresá un correo electrónico válido.", tono: "error" });
    if (password.length < 8) return setMensaje({ texto: "La contraseña debe tener al menos 8 caracteres.", tono: "error" });

    recordarEmail(recordar ? email.trim() : null);
    setEnviando(true);
    setMensaje({ texto: "Iniciando sesión…", tono: "" });
    try {
      const respuesta = await iniciarSesion(email.trim(), password);
      guardarSesion(respuesta);
      setMensaje({ texto: `¡Bienvenido/a, ${respuesta.user.nombre}! Sesión iniciada correctamente.`, tono: "success" });
    } catch (error) {
      setMensaje({ texto: error instanceof ErrorApi ? error.message : "No se pudo iniciar sesión.", tono: "error" });
    } finally {
      setEnviando(false);
    }
  };

  const recuperar = () => {
    setMensaje({
      texto: email.trim()
        ? "En una versión real se enviaría un enlace de recuperación a ese correo. La recuperación todavía no está conectada."
        : "Primero ingresá tu correo electrónico; en una versión real se enviaría allí el enlace de recuperación.",
      tono: "",
    });
  };

  return (
    <div className="auth-panel" id="loginPanel" role="tabpanel">
      <p className="eyebrow">QUÉ BUENO VERTE DE NUEVO</p>
      <h2>Iniciar sesión</h2>
      <p className="auth-panel-intro">Ingresá tus datos para continuar.</p>
      <form onSubmit={enviar} noValidate>
        <label className="field-label" htmlFor="loginEmail">Correo electrónico</label>
        <input id="loginEmail" type="email" autoComplete="email" placeholder="nombre@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="field-label" htmlFor="loginPassword">Contraseña</label>
        <div className="password-wrap">
          <input
            id="loginPassword"
            type={mostrar ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="password-toggle" type="button" onClick={() => setMostrar(!mostrar)} aria-label={mostrar ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {mostrar ? "Ocultar" : "Ver"}
          </button>
        </div>

        <div className="form-options">
          <label className="remember-option">
            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} /> Recordar correo en este dispositivo
          </label>
          <button type="button" className="text-button" onClick={recuperar}>¿Olvidaste tu contraseña?</button>
        </div>

        <button className="button button-primary button-full auth-submit" type="submit" disabled={enviando}>
          Ingresar a mi cuenta <span aria-hidden="true">→</span>
        </button>
        <p className={`auth-message ${mensaje.tono}`} aria-live="polite">{mensaje.texto}</p>
      </form>
      <p className="switch-prompt">
        ¿Todavía no tenés una cuenta?{" "}
        <button type="button" className="text-button" onClick={onCambiar}>Crear cuenta</button>
      </p>
    </div>
  );
}

const CAMPOS_VACIOS = { firstName: "", lastName: "", email: "", phone: "", role: "", password: "", confirmPassword: "" };

function PanelRegistro({ onCambiar }: { onCambiar: () => void }) {
  const [campos, setCampos] = useState(CAMPOS_VACIOS);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>(SIN_MENSAJE);

  const cambiar = (campo: keyof typeof CAMPOS_VACIOS) => (evento: { target: { value: string } }) =>
    setCampos((previo) => ({ ...previo, [campo]: evento.target.value }));

  const enviar = async (evento: SyntheticEvent) => {
    evento.preventDefault();
    const { firstName, lastName, email, password, confirmPassword, role } = campos;
    if (firstName.trim().length < 2 || lastName.trim().length < 2) return setMensaje({ texto: "Nombre y apellido deben tener al menos 2 letras.", tono: "error" });
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMensaje({ texto: "Ingresá un correo electrónico válido.", tono: "error" });
    if (password.length < 8) return setMensaje({ texto: "La contraseña debe tener al menos 8 caracteres.", tono: "error" });
    if (password !== confirmPassword) return setMensaje({ texto: "Las contraseñas no coinciden. Volvé a escribirlas.", tono: "error" });
    if (role !== "vendedor" && role !== "comprador") return setMensaje({ texto: "Seleccioná el tipo de perfil.", tono: "error" });
    if (!aceptaTerminos) return setMensaje({ texto: "Tenés que aceptar el uso de datos de demostración para continuar.", tono: "error" });

    const datos: RegistroInput = { nombre: firstName.trim(), apellido: lastName.trim(), email: email.trim(), password, rol: role };
    setEnviando(true);
    setMensaje({ texto: "Creando tu cuenta…", tono: "" });
    try {
      const respuesta = await registrarse(datos);
      guardarSesion(respuesta);
      setCampos(CAMPOS_VACIOS);
      setAceptaTerminos(false);
      setMensaje({ texto: `¡Cuenta creada con éxito, ${respuesta.user.nombre}! Tus datos fueron guardados en Supabase.`, tono: "success" });
    } catch (error) {
      setMensaje({ texto: error instanceof ErrorApi ? error.message : "No se pudo completar el registro.", tono: "error" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-panel" id="registerPanel" role="tabpanel">
      <p className="eyebrow">EMPEZÁ EN POCOS PASOS</p>
      <h2>Crear una cuenta</h2>
      <p className="auth-panel-intro">Completá los datos básicos de tu perfil.</p>
      <form onSubmit={enviar} noValidate>
        <div className="form-two-columns">
          <div>
            <label className="field-label" htmlFor="firstName">Nombre</label>
            <input id="firstName" type="text" autoComplete="given-name" placeholder="Tu nombre" value={campos.firstName} onChange={cambiar("firstName")} required />
          </div>
          <div>
            <label className="field-label" htmlFor="lastName">Apellido</label>
            <input id="lastName" type="text" autoComplete="family-name" placeholder="Tu apellido" value={campos.lastName} onChange={cambiar("lastName")} required />
          </div>
        </div>

        <label className="field-label" htmlFor="registerEmail">Correo electrónico</label>
        <input id="registerEmail" type="email" autoComplete="email" placeholder="nombre@empresa.com" value={campos.email} onChange={cambiar("email")} required />

        <div className="form-two-columns">
          <div>
            <label className="field-label" htmlFor="phone">Teléfono</label>
            <input id="phone" type="tel" autoComplete="tel" placeholder="+54 9 ..." value={campos.phone} onChange={cambiar("phone")} required />
          </div>
          <div>
            <label className="field-label" htmlFor="userRole">Tipo de perfil</label>
            <select id="userRole" value={campos.role} onChange={cambiar("role")} required>
              <option value="">Seleccionar…</option>
              <option value="vendedor">Productor ganadero</option>
              <option value="comprador">Comerciante</option>
            </select>
          </div>
        </div>

        <div className="form-two-columns">
          <div>
            <label className="field-label" htmlFor="registerPassword">Contraseña</label>
            <div className="password-wrap">
              <input id="registerPassword" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" minLength={8} value={campos.password} onChange={cambiar("password")} required />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="confirmPassword">Repetir contraseña</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repetí la contraseña" minLength={8} value={campos.confirmPassword} onChange={cambiar("confirmPassword")} required />
          </div>
        </div>

        <label className="terms-option">
          <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} required />
          <span>Acepto el uso de estos datos para crear mi perfil de demostración y entiendo que esta versión no guarda cuentas reales.</span>
        </label>

        <button className="button button-primary button-full auth-submit" type="submit" disabled={enviando}>
          Crear mi cuenta <span aria-hidden="true">→</span>
        </button>
        <p className={`auth-message ${mensaje.tono}`} aria-live="polite">{mensaje.texto}</p>
      </form>
      <p className="switch-prompt">
        ¿Ya tenés una cuenta?{" "}
        <button type="button" className="text-button" onClick={onCambiar}>Iniciar sesión</button>
      </p>
    </div>
  );
}
