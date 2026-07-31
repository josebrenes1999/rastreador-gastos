import { Gasto } from "../tipos"
import GastoItem from "./GastoItem"

type ListaGastosProps = {
    gastos : Gasto[];
}

function ListaGastos( { gastos }: ListaGastosProps){
    return(
        <ul>
            {gastos.map((gasto) => (
                <GastoItem key={gasto.id} gasto={gasto} />
            ))

            }
        </ul>
    )
}   

export default ListaGastos;