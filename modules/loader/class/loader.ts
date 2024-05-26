import loader from "../../../config/loader.json";
import hash from "../../hash";

class Loader {
    private static hash: string = "0";

    static CalcHash() {
        hash.CRC32(loader.paths.exe, (err, hash) => {
            if (err)
                return this.hash = "0";

            this.hash = hash;
        });
    }

    static GetHash() {
        return this.hash;
    }
}

if (Loader.GetHash() == "0")
    Loader.CalcHash();

export default Loader;