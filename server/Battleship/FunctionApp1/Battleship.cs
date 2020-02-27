using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Queue;

namespace FunctionApp1 {
    public static class Battleship {
        public static Boolean gameOver = false;

        [FunctionName("Battleship")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req, ILogger log) {
            //log.LogInformation("C# HTTP trigger function processed a request.");

            //We need to somehow get their username input
            string myName = "MyName";

            CloudStorageAccount storageAccount = CloudStorageAccount.Parse("//Enter String here");
            CloudQueueClient queueClient = storageAccount.CreateCloudQueueClient();
            CloudQueue queue = queueClient.GetQueueReference("myqueue");
            queue.CreateIfNotExists();

            //Check if there is someone in the queue. 
            CloudQueueMessage hostName = null;
            try {
                hostName = queue.GetMessage();

                if (hostName != null) {

                    Console.WriteLine("Opposing Player: " + hostName.AsString);
                    queue.DeleteMessage(hostName);
                    // Create local file here
                    //Begin Game
                    //playGame(hostName.AsString);
                } else {
                    Console.WriteLine("Queue is empty");
                    Boolean emptyQueue = true;
                    
                    while (emptyQueue == true) {
                        CloudQueueMessage message = new CloudQueueMessage(myName);
                        queue.AddMessage(message);
                        hostName = queue.GetMessage();
                        if (hostName != null && hostName.AsString != myName) {
                            emptyQueue = false;
                            Console.WriteLine("Opposing Player: " + hostName.AsString);
                            queue.DeleteMessage(hostName);
                            // Create local file here
                            //Begin Game
                            //playGame(hostName.AsString);
                        }
                        System.Threading.Thread.Sleep(5000);
                    }

                }

            } catch {

            }

            return (ActionResult)new OkObjectResult(hostName);
        }
        public static void playGame(String opposingPlayer) {

            setupBoard();
            while (gameOver == false) {
                //Play Game
                //Read file
            }


        }

        public static void setupBoard() {
            Boolean finished = false;
            while (finished == false) {
                //setup...
            }
            return;
        }


    }
}
