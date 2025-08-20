import { GetServerSideProps } from 'next'
import { ChangeEvent, useState, useEffect } from 'react'
import styles from './styles.module.css'
import Head from 'next/head'

import { getSession } from 'next-auth/react'

import { Textarea } from '../../components/textarea'
import {FaShare, FaTrash} from 'react-icons/fa'

import { db } from '../../services/firebaseConnection'

import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'

import Link from 'next/link'

interface DashboardProps{
  user: {
    email: string
  }
}

interface TaskProps{
  id: string;
  created: Date;
  public: boolean;
  task: string;
  user: string;
}

export default function Dashboard({ user }: DashboardProps){

  const [input, setInput] = useState("")
  const [publicTask, setPublicTask] = useState(false)
  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {

    const getTasks = async () => {

      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef,
        orderBy("created", "desc"),
        where('user', '==', user?.email)
      )

      onSnapshot(q, (snapshot) => {
        let list = [] as TaskProps[];

        snapshot.forEach((doc) => {
          list.push({
            id: doc.id,
            task: doc.data().task,
            created: doc.data().created,
            public: doc.data().public,
            user: doc.data().user
          })
        })

        setTasks(list)
      })

    }

    getTasks()

  }, [user?.email])

  const handleChangePublic = (event: ChangeEvent<HTMLInputElement>) => {

    console.log(event.target.checked)
    setPublicTask(event.target.checked)
    

  }

  const handleRegisterTask = async (event: ChangeEvent<HTMLFormElement>) => {
     event.preventDefault()

     if(input === "") return

     try {
      
      await addDoc(collection(db, 'tasks'), {
        task: input,
        created: new Date(),
        user: user?.email,
        public: publicTask
      })

      setInput('')
      setPublicTask(false)

     } catch (err) {
       console.log('Algum erro', err)
     }
  }

  /*
    método para copiar um texto ao clicar, é assíncrono  
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}task/${id}`
    )
  */

  const handleShare = async (id: string) => {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}task/${id}`
    )

    alert('Url copiada com sucesso!')
  }

  const handleDeleteTask = async (id: string) => {
     const docRef = doc(db, 'tasks', id)
     await deleteDoc(docRef)
  }

    return(
        <div className={styles.container}>
          <Head>
            <title>Meu painel de tarefas</title>
          </Head>

          <main className={styles.main}>
             <section className={styles.content}>
               <div className={styles.contentForm}>
                  <h1 className={styles.title}>Qual sua tarefa?</h1>

                  <form onSubmit={handleRegisterTask}>
                     <Textarea 
                     placeholder='Digite sua tarefa'
                     value={input}
                     onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                     />
                     <div className={styles.checkboxArea}>
                       <input 
                        type="checkbox" 
                        className={styles.checkBox}
                        checked={publicTask}
                        onChange={handleChangePublic}
                        />
                       <label>Deixar tarefa pública?</label>
                     </div>

                     <button className={styles.btn} type="submit">
                         Registrar
                     </button>
                  </form>
               </div>
             </section>

             <section className={styles.taskContainer}>
               <h1>Minhas tarefas</h1>

               {
                tasks.map((task) => (

                  <article key={task.id} className={styles.task}>

                    {task.public && 
                    
                     <div className={styles.tagContainer}>
                    
                    <label className={styles.tag}>
                      PUBLICO
                    </label>
                    <button className={styles.shareBtn} onClick={() => handleShare(task.id)}>
                    <FaShare 
                     size={22} 
                     color='#3183ff'
                     />
                    </button> 
                   </div>

                    } 

                  <div className={styles.taskContent}>

                     {task.public ? (
                      <Link href={`/task/${task.id}`}>
                        <p>{task.task}</p>
                      </Link>
                     ) : (
                        <p>{task.task}</p>
                     )}

                    <button className={styles.trashBtn} onClick={() => handleDeleteTask(task.id)}>
                       <FaTrash
                         size={24}
                         color='#ea3140'
                        />
                    </button>
                  </div>
               </article>

                ))
               }

               

             </section>
          </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  
  const session = await getSession({ req })
  
  if(!session?.user){

    return{
      redirect: {
        destination: '/',
        permanent: false
      }
    }

  }

  return{
    props: {
      user:{
        email: session?.user?.email
      }
    }
  }

}