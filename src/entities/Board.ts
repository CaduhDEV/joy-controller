import moment from "moment";
import { Database } from "./Db";


export let cur_task: any[] = []

// criar sistema de board aqui.
export async function loadTasksOnStartup(): Promise<void> {
    try {
        const db = new Database();
        const [tasks] = await db.getTasksWithinPeriod();
        if (tasks.length === 0) { return console.log('Nenhuma task foi encontrada para o quadro de tarefas.'); }
        cur_task = [ tasks.purpose, tasks.fast, tasks.book, tasks.prayer ]
        console.log('Tarefas encontradas, atualizando main_menu dos usuários.')
    
    } catch (error) {
    }
}