function checkUrlForSuccess() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    const banner = document.getElementById("successBanner");
    banner.classList.remove("hidden");

    // Oculta o banner após 5 segundos
    setTimeout(() => {
      banner.classList.add("hidden");
      // Limpa o parâmetro da URL sem recarregar a página
      const url = new URL(window.location);
      url.searchParams.delete("success");
      window.history.replaceState({}, document.title, url);
    }, 5000);
  }
}

// Chama a função ao carregar a página
window.onload = checkUrlForSuccess;
