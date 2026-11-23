"""Teste rápido da API deste site, sem precisar do Supabase:  python test_api.py"""
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("api", Path(__file__).parent / "api" / "index.py")
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)

enviados = []


def falso_supabase(metodo, caminho, corpo=None):
    enviados.append(corpo)
    dados = {"nome": "Teste", "fotolivro": {"titulo": "Livro"}, "fotolivro_rascunho": {"titulo": "Secreto"}}
    return [{"dados": dados}] if "site_config" in caminho else []


api.supabase = falso_supabase
c = api.app.test_client()

assert c.get("/api/config").json == {"nome": "Teste"}
assert c.get("/api/fotolivro").json == {"titulo": "Livro"}
assert c.get("/fotolivro").status_code == 200 and c.get("/fotolivro/livro.js").status_code == 200
assert c.get("/api/itens").status_code == 200
assert c.post("/api/contato", json={"nome": "Ana", "email": "a@b.com", "origem": "outro"}).status_code == 201
assert enviados[-1]["origem"] == api.SITE  # a origem é definida pelo servidor
assert c.post("/api/contato", json={"nome": "Ana", "email": "invalido"}).status_code == 400
assert c.get("/").status_code == 200 and c.get("/assets/main.js").status_code == 200
for proibido in ("/api/index.py", "/.env", "/README.md"):
    assert c.get(proibido).status_code == 404, proibido

print("OK: todos os testes passaram")
