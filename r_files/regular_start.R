debug <- FALSE # isTRUE(nzchar(Sys.getenv("DEBUG")))
Rserve::Rserve(debug, args=c("--RS-conf", "r_files/no_oc.conf", "--vanilla", "--no-save"))
