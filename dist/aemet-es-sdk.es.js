//#region src/apiKey.js
var e = () => {
	try {
		let e = (typeof process < "u" && process.env ? process.env.AEMET_API_KEY || process.env.NEXT_PUBLIC_AEMET_API_KEY || process.env.REACT_APP_AEMET_API_KEY : void 0) || "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjaGVtYXJAZ21haWwuY29tIiwianRpIjoiMzgwMWJiOWEtNzgzZS00NzljLTk2MDItNWEzYTA0OTA2NDBjIiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE3NzMzOTIxNDcsInVzZXJJZCI6IjM4MDFiYjlhLTc4M2UtNDc5Yy05NjAyLTVhM2EwNDkwNjQwYyIsInJvbGUiOiIifQ.MCvlllxmCVAsPY86iSH26C5_U6PS-lkjjJ1nhqKF8-M";
		if (!e) throw Error("⚠️ [aemet-e-sdk] No se encontró ninguna API Key de AEMET. Asegúrate de configurarla en tu archivo .env como AEMET_API_KEY");
		return e;
	} catch (e) {
		return e;
	}
}, t = "", n = async (n) => {
	try {
		let r = e();
		if (r instanceof Error) throw r;
		let i = `${t}${n}`, a = await fetch(i, { headers: { api_key: r } });
		if (!a.ok) {
			if (a.status === 404) return [];
			let e = await a.text();
			throw Error(`AEMET inicial ${a.status}: ${e.slice(0, 200)}`);
		}
		let o = await a.json();
		if (o.estado && o.estado !== 200) throw Error(`AEMET control ${o.estado}: ${o.descripcion}`);
		return o;
	} catch (e) {
		return e;
	}
}, r = (e) => e?.trim().split(" ").map((e) => {
	let [t, n] = e.split(",").map(Number);
	return [n, t];
}).filter((e) => !isNaN(e[0]) && !isNaN(e[1])) || [];
function i(e) {
	let t = /* @__PURE__ */ new Map();
	return e.forEach((e) => {
		if (!e.poligon) return;
		let n = `${e.poligon}|${e.inicio}`;
		t.has(n) || t.set(n, {
			id: e.id,
			poligon: e.poligon,
			zona: e.zona,
			inicio: e.inicio,
			fin: e.fin,
			nivel: e.nivel,
			eventos: [],
			descripciones: []
		});
		let r = t.get(n);
		r.eventos.push(e.evento), e.descripcion && r.descripciones.push(e.descripcion);
	}), Array.from(t.values()).map((e) => ({
		...e,
		eventos: [...new Set(e.eventos)],
		descripcion: e.descripciones.join(" | ") || null,
		poligon: r(e.poligon)
	}));
}
async function a(e) {
	let t = await (await fetch(e)).arrayBuffer(), n = new Uint8Array(t), r = [], a = 0;
	for (; a < n.length;) {
		let e = n.slice(a, a + 512), t = new TextDecoder().decode(e.slice(0, 100)).replace(/\0/g, "");
		if (!t) break;
		let i = new TextDecoder().decode(e.slice(124, 136)).replace(/\0/g, "").trim(), o = parseInt(i, 8), s = a + 512, c = s + o, l = new TextDecoder().decode(n.slice(s, c));
		if (t.endsWith(".xml")) {
			let e = new globalThis.DOMParser().parseFromString(l, "text/xml"), t = Array.from(e.querySelectorAll("info")).find((e) => e.querySelector("language")?.textContent === "es-ES");
			if (t) {
				let n = Array.from(t.querySelectorAll("parameter")), i = n.find((e) => e.querySelector("valueName")?.textContent?.includes("nivel"))?.querySelector("value")?.textContent ?? null, a = n.find((e) => e.querySelector("valueName")?.textContent?.includes("parametro"))?.querySelector("value")?.textContent ?? null;
				r.push({
					id: e.querySelector("identifier")?.textContent ?? null,
					evento: t.querySelector("event")?.textContent ?? null,
					nivel: i,
					zona: t.querySelector("areaDesc")?.textContent ?? null,
					poligon: t.querySelector("polygon")?.textContent || "",
					inicio: t.querySelector("onset")?.textContent ?? null,
					fin: t.querySelector("expires")?.textContent ?? null,
					descripcion: t.querySelector("description")?.textContent ?? null,
					parametro: a
				});
			}
		}
		a = s + Math.ceil(o / 512) * 512;
	}
	return i(r);
}
async function o() {
	try {
		let e = (await n("/aemet/avisos_cap/ultimoelaborado/area/esp")).datos;
		if (!e) throw Error("AEMET: No se encontró URL de datos");
		let t = await a(e), r = {
			desconocido: [],
			verde: [],
			amarillo: [],
			naranja: [],
			rojo: []
		};
		return t.forEach((e) => {
			e.nivel === "amarillo" ? r.amarillo.push(e) : e.nivel === "verde" ? r.verde.push(e) : e.nivel === "rojo" ? r.rojo.push(e) : e.nivel === "naranja" ? r.naranja.push(e) : r.desconocido.push(e);
		}), r;
	} catch (e) {
		return e;
	}
}
//#endregion
export { n as getAemetUrlData, e as getApiKey, o as getLastAlerts };

//# sourceMappingURL=aemet-es-sdk.es.js.map